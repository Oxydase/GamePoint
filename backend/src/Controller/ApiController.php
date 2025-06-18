<?php

namespace App\Controller;

use App\Entity\Shop;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\HttpFoundation\Request;
use Doctrine\ORM\EntityManagerInterface;

final class ApiController extends AbstractController
{
    #[Route('/api/me', name: 'api_me', methods: ['GET'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function me(): JsonResponse
    {
        $user = $this->getUser();

        return $this->json([
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
    public function createShop(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();

        if ($user->getShop()) {
            return $this->json(['message' => 'Vous avez déjà une boutique.'], 400);
        }

        $data = json_decode($request->getContent(), true);
        $requiredFields = ['name', 'phone', 'address'];

        foreach ($requiredFields as $field) {
            if (empty($data[$field])) {
                return $this->json(['message' => "Champ requis: $field"], 400);
            }
        }

        $shop = new Shop();
        $shop->setName($data['name']);
        $shop->setPhone($data['phone']);
        $shop->setAddress($data['address']);
        $shop->setCreatedAt(new \DateTime());
        $shop->setUpdatedAt(new \DateTime());

        $em->persist($shop);

        $user->setShop($shop);
        $em->persist($user);

        $em->flush();

        return $this->json([
            'message' => 'Boutique créée avec succès',
            'shop' => [
                'id' => $shop->getId(),
                'name' => $shop->getName(),
                'phone' => $shop->getPhone(),
                'address' => $shop->getAddress()
            ]
        ]);
    }
}