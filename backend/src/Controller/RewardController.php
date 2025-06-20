<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

namespace App\Controller;

use App\Entity\Reward;
use App\Entity\RewardExchange;
use App\Entity\LoyaltyPoints;
use App\Entity\Transaction;
use App\Entity\User;
use App\Service\QrCodeService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;
class RewardController extends AbstractController
{
    #[Route('/api/rewards', name: 'api_rewards', methods: ['GET'])]
    public function list(EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Non authentifié'], 401);
        }

        // Récupération des récompenses actives
        $rewards = $em->getRepository(Reward::class)->findBy(['isActive' => true]);
        
        $rewardsData = [];
        foreach ($rewards as $reward) {
            // le solde du client pouer la boutique
            $loyaltyPoints = $em->getRepository(LoyaltyPoints::class)->findOneBy([
                'user' => $user,
                'shop' => $reward->getShopId()
            ]);
            
            $balance = $loyaltyPoints ? $loyaltyPoints->getPointsBalance() : 0;
            
            //  si déjà échangé
            $alreadyExchanged = $em->getRepository(RewardExchange::class)->findOneBy([
                'user' => $user,
                'reward' => $reward
            ]);
            
            $rewardsData[] = [
                'id' => $reward->getId(),
                'name' => $reward->getName(),
                'description' => $reward->getDescription(),
                'points_cost' => $reward->getPointsCost(),
                'quantity_available' => $reward->getQuantityAvailable(),
                'shop' => $reward->getShopId()->getName(),
                'shop_id' => $reward->getShopId()->getId(),
                'user_balance' => $balance,
                'can_redeem' => $balance >= $reward->getPointsCost() && !$alreadyExchanged && $reward->getQuantityAvailable() > 0,
                'already_exchanged' => $alreadyExchanged !== null
            ];
        }
        
        return $this->json(['rewards' => $rewardsData]);
    }





    #[Route('/api/redeem', name: 'api_redeem', methods: ['POST'])]
    public function redeem(
        Request $request,
        EntityManagerInterface $em,
        QrCodeService $qrCodeService
    ): JsonResponse {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Non authentifié'], 401);
        }
        
        $data = json_decode($request->getContent(), true);
        $rewardId = $data['reward_id'] ?? null;
        
        if (!$rewardId) {
            return $this->json(['error' => 'reward_id requis'], 400);
        }
        
        // Récupérer la récompense
        $reward = $em->getRepository(Reward::class)->find($rewardId);
        if (!$reward || !$reward->isActive()) {
            return $this->json(['error' => 'Récompense non disponible'], 404);
        }
        
        // Quantité
        if ($reward->getQuantityAvailable() <= 0) {
            return $this->json(['error' => 'Stock épuisé'], 410);
        }
        
        // Vérifie si déjà échangé
        $existingExchange = $em->getRepository(RewardExchange::class)->findOneBy([
            'user' => $user,
            'reward' => $reward
        ]);
        
        if ($existingExchange) {
            return $this->json(['error' => 'Récompense déjà échangée'], 409);
        }
        
        // Vérifie le solde
        $loyaltyPoints = $em->getRepository(LoyaltyPoints::class)->findOneBy([
            'user' => $user,
            'shop' => $reward->getShopId()
        ]);
        
        if (!$loyaltyPoints || $loyaltyPoints->getPointsBalance() < $reward->getPointsCost()) {
            return $this->json(['error' => 'Solde insuffisant'], 403);
        }
        
        try {
            // Créer l'échange
            $exchange = new RewardExchange();
            $exchange->setUserId($user);
            $exchange->setRewardId($reward);
            
            // Déduire les points
            $newBalance = $loyaltyPoints->getPointsBalance() - $reward->getPointsCost();
            $loyaltyPoints->setPointsBalance($newBalance);
            $loyaltyPoints->setUpdatedAt(new \DateTime());
            
            // Créer la transaction
            $transaction = new Transaction();
            $transaction->setUserId($user);
            $transaction->setShopId($reward->getShopId());
            $transaction->setOperationType('Échange récompense - ' . $reward->getName());
            $transaction->setPointAmount(-$reward->getPointsCost());
            $transaction->setRewardId($reward);
            $transaction->setTransactionDate(new \DateTime());
            $transaction->setCreatedAt(new \DateTime());
            
            // Réduire le stock
            $reward->setQuantityAvailable($reward->getQuantityAvailable() - 1);
            
            // Générer l'image QR
            $qrCodeImage = $qrCodeService->generateQrCodeImage($exchange->getQrCode());
            
            // Sauvegarder
            $em->persist($exchange);
            $em->persist($transaction);
            $em->flush();
            
            return $this->json([
                'success' => true,
                'exchange' => [
                    'code' => $exchange->getExchangeCode(),
                    'qr_code' => 'data:image/png;base64,' . $qrCodeImage,
                    'qr_code_data' => $exchange->getQrCode(),
                    'reward_name' => $reward->getName(),
                    'shop' => $reward->getShopId()->getName(),
                    'expires_at' => $exchange->getExpiresAt()->format('c'),
                    'status' => $exchange->getStatus()
                ]
            ], 201);
            
        } catch (\Exception $e) {
            return $this->json(['error' => 'Erreur lors de l\'échange', 'details' => $e->getMessage()], 500);
        }




       
    }

    #[Route('/api/validate-reward', name: 'api_validate_reward', methods: ['POST'])]
    public function validateReward(
        Request $request,
        EntityManagerInterface $em
    ): JsonResponse {
        $merchant = $this->getUser();
        
        // Vérifie si commerçant
        if (!$merchant || !in_array('ROLE_MERCHANT', $merchant->getRoles())) {
            return $this->json(['error' => 'Accès refusé - Commerçant requis'], 403);
        }
        
        if (!$merchant->getShop()) {
            return $this->json(['error' => 'Commerçant sans boutique assignée'], 400);
        }
        
        $data = json_decode($request->getContent(), true);
        $rewardCode = $data['reward_code'] ?? null;
        
        if (!$rewardCode) {
            return $this->json(['error' => 'reward_code requis'], 400);
        }
        
        // echange par le code
        $exchange = $em->getRepository(RewardExchange::class)->findOneBy([
            'exchangeCode' => $rewardCode
        ]);
        
        if (!$exchange) {
            return $this->json(['error' => 'Code de récompense invalide'], 404);
        }
        
        // si bonne boutique
        if ($exchange->getRewardId()->getShopId()->getId() !== $merchant->getShop()->getId()) {
            return $this->json(['error' => 'Cette récompense n\'appartient pas à votre boutique'], 403);
        }
        
        //  statut
        if ($exchange->getStatus() === 'used') {
            return $this->json(['error' => 'Récompense déjà utilisée'], 409);
        }
        
        // expiration
        if ($exchange->getExpiresAt() < new \DateTime()) {
            $exchange->setStatus('expired');
            $em->flush();
            return $this->json(['error' => 'Récompense expirée'], 410);
        }
        
        try {
            //  utilisée ou non 
            $exchange->setStatus('used');
            $exchange->setUsedAt(new \DateTime());
            
            $em->flush();
            
            return $this->json([
                'success' => true,
                'reward' => [
                    'client' => $exchange->getUserId()->getFirstname() . ' ' . $exchange->getUserId()->getLastname(),
                    'client_email' => $exchange->getUserId()->getEmail(),
                    'type' => $exchange->getRewardId()->getName(),
                    'description' => $exchange->getRewardId()->getDescription(),
                    'message' => 'Récompense validée avec succès',
                    'validated_at' => (new \DateTime())->format('Y-m-d H:i:s')
                ]
            ]);
            
        } catch (\Exception $e) {
            return $this->json(['error' => 'Erreur lors de la validation'], 500);
        }
    }






    // Bonus 

    #[Route('/api/my-rewards', name: 'api_my_rewards', methods: ['GET'])]
    public function myRewards(EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Non authentifié'], 401);
        }
        
        $exchanges = $em->getRepository(RewardExchange::class)->findBy(
            ['user' => $user],
            ['dateExchange' => 'DESC']
        );
        
        $exchangesData = [];
        foreach ($exchanges as $exchange) {
            $exchangesData[] = [
                'code' => $exchange->getExchangeCode(),
                'reward_name' => $exchange->getRewardId()->getName(),
                'shop' => $exchange->getRewardId()->getShopId()->getName(),
                'points_spent' => $exchange->getRewardId()->getPointsCost(),
                'date_exchange' => $exchange->getDateExchange()->format('Y-m-d H:i:s'),
                'expires_at' => $exchange->getExpiresAt()->format('Y-m-d H:i:s'),
                'status' => $exchange->getStatus(),
                'used_at' => $exchange->getUsedAt() ? $exchange->getUsedAt()->format('Y-m-d H:i:s') : null
            ];
        }
        
        return $this->json(['exchanges' => $exchangesData]);
    }





    // Manage rewards 


    // Get all rewards for a merchant's shop
    #[Route('/api/shop/rewards', name: 'api_shop_rewards', methods: ['GET'])]
    public function getShopRewards(EntityManagerInterface $em): JsonResponse
    {
        $merchant = $this->getUser();
        
        if (!$merchant || !in_array('ROLE_MERCHANT', $merchant->getRoles())) {
            return $this->json(['error' => 'Accès refusé - Commerçant requis'], 403);
        }
        
        if (!$merchant->getShop()) {
            return $this->json(['error' => 'Commerçant sans boutique assignée'], 400);
        }
        
        $rewards = $em->getRepository(Reward::class)->findBy([
            'shop' => $merchant->getShop()
        ], ['createdAt' => 'DESC']);
        
        $rewardsData = [];
        foreach ($rewards as $reward) {
            $rewardsData[] = [
                'id' => $reward->getId(),
                'name' => $reward->getName(),
                'description' => $reward->getDescription(),
                'points_cost' => $reward->getPointsCost(),
                'quantity_available' => $reward->getQuantityAvailable(),
                'is_active' => $reward->isActive(),
                'created_at' => $reward->getCreatedAt()->format('Y-m-d H:i:s')
            ];
        }
        
        return $this->json(['rewards' => $rewardsData]);
    }


    // Add a new reward
    #[Route('/api/shop/rewards', name: 'api_shop_rewards_create', methods: ['POST'])]
    public function createReward(
        Request $request,
        EntityManagerInterface $em,
        ValidatorInterface $validator
    ): JsonResponse {
        $merchant = $this->getUser();
        
        if (!$merchant || !in_array('ROLE_MERCHANT', $merchant->getRoles())) {
            return $this->json(['error' => 'Accès refusé - Commerçant requis'], 403);
        }
        
        if (!$merchant->getShop()) {
            return $this->json(['error' => 'Commerçant sans boutique assignée'], 400);
        }
        
        $data = json_decode($request->getContent(), true);
        
        $requiredFields = ['name', 'description', 'points_cost', 'quantity_available'];
        foreach ($requiredFields as $field) {
            if (!isset($data[$field]) || empty($data[$field])) {
                return $this->json(['error' => "Le champ '$field' est requis"], 400);
            }
        }
        
        $reward = new Reward();
        $reward->setName($data['name']);
        $reward->setDescription($data['description']);
        $reward->setPointsCost((int) $data['points_cost']);
        $reward->setQuantityAvailable((int) $data['quantity_available']);
        $reward->setIsActive(true);
        $reward->setShopId($merchant->getShop());
        $reward->setCreatedAt(new \DateTime());
        
        $errors = $validator->validate($reward);
        if (count($errors) > 0) {
            return $this->json(['errors' => (string) $errors], 400);
        }
        
        $em->persist($reward);
        $em->flush();
        
        return $this->json([
            'message' => 'Récompense créée avec succès',
            'reward' => [
                'id' => $reward->getId(),
                'name' => $reward->getName(),
                'description' => $reward->getDescription(),
                'points_cost' => $reward->getPointsCost(),
                'quantity_available' => $reward->getQuantityAvailable()
            ]
        ], 201);
    }


    // Modify an existing reward
    #[Route('/api/shop/rewards/{id}', name: 'api_shop_rewards_update', methods: ['PUT'])]
    public function updateReward(
        int $id,
        Request $request,
        EntityManagerInterface $em,
        ValidatorInterface $validator
    ): JsonResponse {
        $merchant = $this->getUser();
        
        if (!$merchant || !in_array('ROLE_MERCHANT', $merchant->getRoles())) {
            return $this->json(['error' => 'Accès refusé - Commerçant requis'], 403);
        }
        
        if (!$merchant->getShop()) {
            return $this->json(['error' => 'Commerçant sans boutique assignée'], 400);
        }
        
        $reward = $em->getRepository(Reward::class)->find($id);
        
        if (!$reward) {
            return $this->json(['error' => 'Récompense non trouvée'], 404);
        }
        
        // Vérifie que la récompense appartient à la boutique du commerçant
        if ($reward->getShopId()->getId() !== $merchant->getShop()->getId()) {
            return $this->json(['error' => 'Cette récompense ne vous appartient pas'], 403);
        }
        
        $data = json_decode($request->getContent(), true);
        
        if (isset($data['name'])) {
            $reward->setName($data['name']);
        }
        if (isset($data['description'])) {
            $reward->setDescription($data['description']);
        }
        if (isset($data['points_cost'])) {
            $reward->setPointsCost((int) $data['points_cost']);
        }
        if (isset($data['quantity_available'])) {
            $reward->setQuantityAvailable((int) $data['quantity_available']);
        }
        if (isset($data['is_active'])) {
            $reward->setIsActive((bool) $data['is_active']);
        }
        
        $errors = $validator->validate($reward);
        if (count($errors) > 0) {
            return $this->json(['errors' => (string) $errors], 400);
        }
        
        $em->flush();
        
        return $this->json([
            'message' => 'Récompense modifiée avec succès',
            'reward' => [
                'id' => $reward->getId(),
                'name' => $reward->getName(),
                'description' => $reward->getDescription(),
                'points_cost' => $reward->getPointsCost(),
                'quantity_available' => $reward->getQuantityAvailable(),
                'is_active' => $reward->isActive()
            ]
        ]);
    }

    // Delete a reward
    #[Route('/api/shop/rewards/{id}', name: 'api_shop_rewards_delete', methods: ['DELETE'])]
    public function deleteReward(
        int $id,
        EntityManagerInterface $em
    ): JsonResponse {
        $merchant = $this->getUser();
        
        if (!$merchant || !in_array('ROLE_MERCHANT', $merchant->getRoles())) {
            return $this->json(['error' => 'Accès refusé - Commerçant requis'], 403);
        }
        
        if (!$merchant->getShop()) {
            return $this->json(['error' => 'Commerçant sans boutique assignée'], 400);
        }
        
        $reward = $em->getRepository(Reward::class)->find($id);
        
        if (!$reward) {
            return $this->json(['error' => 'Récompense non trouvée'], 404);
        }
        
        // Vérifier que la récompense appartient à la boutique du commerçant
        if ($reward->getShopId()->getId() !== $merchant->getShop()->getId()) {
            return $this->json(['error' => 'Cette récompense ne vous appartient pas'], 403);
        }
        
        // Vérifier s'il y a des échanges en cours
        $activeExchanges = $em->getRepository(RewardExchange::class)->findBy([
            'reward' => $reward,
            'status' => 'pending'
        ]);
        
        if (count($activeExchanges) > 0) {
            return $this->json([
                'error' => 'Impossible de supprimer cette récompense car des échanges sont en cours'
            ], 409);
        }
        
        $rewardName = $reward->getName();
        $em->remove($reward);
        $em->flush();
        
        return $this->json([
            'message' => "Récompense '$rewardName' supprimée avec succès"
        ]);
    }

    // Activate/Deactivate a reward
    #[Route('/api/shop/rewards/{id}/toggle', name: 'api_shop_rewards_toggle', methods: ['PATCH'])]
    public function toggleReward(
        int $id,
        EntityManagerInterface $em
    ): JsonResponse {
        $merchant = $this->getUser();
        
        if (!$merchant || !in_array('ROLE_MERCHANT', $merchant->getRoles())) {
            return $this->json(['error' => 'Accès refusé - Commerçant requis'], 403);
        }
        
        $reward = $em->getRepository(Reward::class)->find($id);
        
        if (!$reward || $reward->getShopId()->getId() !== $merchant->getShop()->getId()) {
            return $this->json(['error' => 'Récompense non trouvée'], 404);
        }
        
        $reward->setIsActive(!$reward->isActive());
        $em->flush();
        
        $status = $reward->isActive() ? 'activée' : 'désactivée';
        
        return $this->json([
            'message' => "Récompense $status avec succès",
            'is_active' => $reward->isActive()
        ]);
    }
}