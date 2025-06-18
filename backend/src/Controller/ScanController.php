<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use App\Entity\User;
use App\Entity\Shop;
use App\Entity\Transaction;
use App\Entity\LoyaltyPoints;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class ScanController extends AbstractController
{
    #[Route('/api/scan', name: 'api_scan', methods: ['POST'])]
    public function scan(
        Request $request,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): JsonResponse {
        // recuperation du commerçant connecté 

        $merchant = $this->getUser();

        if (!$merchant || !in_array('ROLE_MERCHANT', $merchant->getRoles())) {
        return $this->json(['error' => 'Accès refusé - Commerçant requis'], 403);
    }

    if (!$merchant->getShop()) {
        return $this->json(['error' => 'Commerçant sans boutique assignée'], 400);
    }

    // recuperation des données de la requête

    $data = json_decode($request->getContent(), true);

    if (!$data) {
        return $this->json(['error' => 'Données JSON invalides'], 400);
    }
    
    // Validation des champs 
    $requiredFields = ['qr_code_data', 'operation_type', 'prix_total'];
    foreach ($requiredFields as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            return $this->json(['error' => "Le champ '$field' est requis"], 400);
        }
    }

    // trouver le client 

    $userRepository = $entityManager->getRepository(User::class);
    $client = $userRepository->findOneBy(['qrCode' => $data['qr_code_data']]);
    
    if (!$client) {
        return $this->json(['error' => 'Client non trouvé avec ce QR code'], 404);
    }

    //  Validation du montant de points

    $prixTotal = (int) $data['prix_total'];
    if ($prixTotal <= 0) {
        return $this->json(['error' => 'Le prix total doit être positif'], 400);
    }

      try {
        // Création de  la transaction
        $transaction = new Transaction();
        $transaction->setUserId($client);
        $transaction->setShopId($merchant->getShop());
        $transaction->setTransactionDate(new \DateTime());
        $transaction->setOperationType($data['operation_type']);
        $transaction->setPointAmount($prixTotal);
        $transaction->setCreatedAt(new \DateTime());
        

         //Mis à jour ou creation des points de fidélité
        $loyaltyPointsRepository = $entityManager->getRepository(LoyaltyPoints::class);
        $loyaltyPoints = $loyaltyPointsRepository->findOneBy([
            'user' => $client,
            'shop' => $merchant->getShop()
        ]);
        if (!$loyaltyPoints) {
            // Première fois du client en boutique
            $loyaltyPoints = new LoyaltyPoints();
            $loyaltyPoints->setUserId($client);
            $loyaltyPoints->setShopId($merchant->getShop());
            $loyaltyPoints->setPointsBalance($prixTotal);
            $loyaltyPoints->setCreatedAt(new \DateTime());
        } else {
            // Client existant, on ajoute les points
            $currentBalance = $loyaltyPoints->getPointsBalance();
            $loyaltyPoints->setPointsBalance($currentBalance + $prixTotal);
        }
        
        $loyaltyPoints->setUpdatedAt(new \DateTime());
        
        //  Sauvegarde en base
        $entityManager->persist($transaction);
        $entityManager->persist($loyaltyPoints);
        $entityManager->flush();
        
        return $this->json([
            'success' => true,
            'message' => 'Points attribués avec succès',
            'transaction' => [
                'client' => $client->getFirstname() . ' ' . $client->getLastname(),
                'client_email' => $client->getEmail(),
                'operation_type' => $data['operation_type'],
                'points_awarded' => $prixTotal,
                'new_balance' => $loyaltyPoints->getPointsBalance(),
                'shop' => $merchant->getShop()->getName(),
                'transaction_date' => $transaction->getTransactionDate()->format('Y-m-d H:i:s')
            ]
        ], 201);
        
    } catch (\Exception $e) {
        return $this->json([
            'error' => 'Erreur lors de l\'attribution des points',
            'details' => $e->getMessage()
        ], 500);
    }
}
}