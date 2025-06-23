<?php

namespace App\Controller;

use App\Entity\Shop;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\HttpFoundation\Request;
use Doctrine\ORM\EntityManagerInterface;
use App\Repository\LoyaltyPointsRepository;
use Symfony\Component\HttpFoundation\File\Exception\FileException;
use Psr\Log\LoggerInterface;

final class ApiController extends AbstractController
{
    #[Route('/api/me', name: 'api_me', methods: ['GET'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function me(): JsonResponse
    {
        $user = $this->getUser();

        return $this->json([
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'lastname' => $user->getLastname(),
            'firstname' => $user->getFirstname(),
            'phone' => $user->getPhone(),
        ]);
    }

    #[Route('/api/me', name: 'api_me_update', methods: ['PUT'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function updateMe(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();

        $data = json_decode($request->getContent(), true);

        $user->setFirstname($data['firstname'] ?? $user->getFirstname());
        $user->setLastname($data['lastname'] ?? $user->getLastname());
        $user->setPhone($data['phone'] ?? $user->getPhone());
        $user->setEmail($data['email'] ?? $user->getEmail());

        $em->persist($user);
        $em->flush();

        return $this->json([
            'message' => 'Profil mis à jour',
            'user' => [
                'firstname' => $user->getFirstname(),
                'lastname' => $user->getLastname(),
                'phone' => $user->getPhone(),
                'email' => $user->getEmail(),
            ]
        ]);
    }

    #[Route('/api/shop/create', name: 'api_shop_create', methods: ['POST'])]
    #[IsGranted('ROLE_MERCHANT')]
    public function createShop(Request $request, EntityManagerInterface $em, LoggerInterface $logger): JsonResponse
    {
        try {
            $user = $this->getUser();

            // Debug : Vérifier les données reçues
            $logger->info('Création boutique - Données reçues', [
                'request_data' => $request->request->all(),
                'files' => array_keys($request->files->all()),
                'content_type' => $request->headers->get('Content-Type')
            ]);

            if ($user->getShop()) {
                return $this->json(['message' => 'Vous avez déjà une boutique.'], 400);
            }

            // Récupérer les données textuelles
            $name = $request->request->get('name');
            $phone = $request->request->get('phone');
            $address = $request->request->get('address');

            $logger->info('Données extraites', [
                'name' => $name,
                'phone' => $phone,
                'address' => $address
            ]);

            $requiredFields = ['name' => $name, 'phone' => $phone, 'address' => $address];

            foreach ($requiredFields as $field => $value) {
                if (empty($value)) {
                    $logger->error("Champ manquant: $field");
                    return $this->json(['message' => "Champ requis: $field"], 400);
                }
            }

            $shop = new Shop();
            $shop->setName($name);
            $shop->setPhone($phone);
            $shop->setAddress($address);
            $shop->setCreatedAt(new \DateTime());
            $shop->setUpdatedAt(new \DateTime());

            // Traitement du fichier bannière avec debug
            $bannerFile = $request->files->get('banner');
            if ($bannerFile) {
                $logger->info('Fichier bannière reçu', [
                    'original_name' => $bannerFile->getClientOriginalName(),
                    'mime_type' => $bannerFile->getMimeType(),
                    'size' => $bannerFile->getSize(),
                    'error' => $bannerFile->getError(),
                    'extension' => $bannerFile->guessExtension()
                ]);

                // Vérifier que le fichier est valide
                if ($bannerFile->getError() !== UPLOAD_ERR_OK) {
                    $logger->error('Erreur upload fichier', ['error_code' => $bannerFile->getError()]);
                    return $this->json(['message' => 'Erreur lors de l\'upload du fichier.'], 400);
                }

                // Vérifier le type MIME
                $allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
                if (!in_array($bannerFile->getMimeType(), $allowedMimes)) {
                    $logger->error('Type de fichier non autorisé', ['mime_type' => $bannerFile->getMimeType()]);
                    return $this->json(['message' => 'Type de fichier non autorisé. Utilisez JPG, PNG ou WebP.'], 400);
                }

                // Vérifier la taille (max 5MB)
                if ($bannerFile->getSize() > 5 * 1024 * 1024) {
                    $logger->error('Fichier trop volumineux', ['size' => $bannerFile->getSize()]);
                    return $this->json(['message' => 'Le fichier est trop volumineux (max 5MB).'], 400);
                }

                $uploadsDir = $this->getParameter('uploads_directory') ?? $this->getParameter('kernel.project_dir') . '/public/uploads';
                
                // Créer le dossier s'il n'existe pas
                if (!is_dir($uploadsDir)) {
                    mkdir($uploadsDir, 0755, true);
                }

                $newFilename = uniqid() . '.' . $bannerFile->guessExtension();

                try {
                    $bannerFile->move($uploadsDir, $newFilename);
                    $shop->setBanner($newFilename);
                    $logger->info('Fichier bannière sauvegardé', ['filename' => $newFilename]);
                } catch (FileException $e) {
                    $logger->error('Erreur lors du déplacement du fichier', ['error' => $e->getMessage()]);
                    return $this->json(['message' => 'Erreur lors de l\'upload de la bannière: ' . $e->getMessage()], 500);
                }
            } else {
                $logger->info('Aucun fichier bannière fourni');
            }

            $em->persist($shop);
            $user->setShop($shop);
            $em->persist($user);
            $em->flush();

            $logger->info('Boutique créée avec succès', ['shop_id' => $shop->getId()]);

            return $this->json([
                'message' => 'Boutique créée avec succès',
                'shop' => [
                    'id' => $shop->getId(),
                    'name' => $shop->getName(),
                    'phone' => $shop->getPhone(),
                    'address' => $shop->getAddress(),
                    'banner' => $shop->getBanner(),
                ]
            ]);

        } catch (\Exception $e) {
            $logger->error('Erreur lors de la création de la boutique', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return $this->json([
                'message' => 'Erreur interne du serveur: ' . $e->getMessage()
            ], 500);
        }
    }

    #[Route('/api/loyalty', name: 'api_loyalty_points', methods: ['GET'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function getLoyaltyPoints(LoyaltyPointsRepository $loyaltyRepo): JsonResponse
    {
        $user = $this->getUser();
        $points = $loyaltyRepo->findBy(['user' => $user]);

        $data = [];

        foreach ($points as $point) {
            $data[] = [
                'id' => $point->getId(),
                'shop_id' => $point->getShopId()->getId(),
                'shop_name' => $point->getShopId()->getName(),
                'points_balance' => $point->getPointsBalance(),
                'updated_at' => $point->getUpdatedAt()->format('Y-m-d H:i:s'),
            ];
        }

        return $this->json($data);
    }

    #[Route('/api/shops', name: 'api_all_shops', methods: ['GET'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function getAllShops(EntityManagerInterface $em): JsonResponse
    {
        $shopRepository = $em->getRepository(Shop::class);
        $shops = $shopRepository->findAll();

        $data = [];
        foreach ($shops as $shop) {
            $data[] = [
                'id' => $shop->getId(),
                'name' => $shop->getName(),
                'phone' => $shop->getPhone(),
                'address' => $shop->getAddress(),
                'banner' => $shop->getBanner(),
                'created_at' => $shop->getCreatedAt()->format('Y-m-d H:i:s'),
            ];
        }

        return $this->json($data);
    }
}