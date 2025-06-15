<?php

namespace App\Controller;

use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

final class ApiController extends AbstractController
{
    #[Route('api/home', name: 'app_home')]
    public function home(TokenStorageInterface $tokenStorage): JsonResponse
    {
        $token = $tokenStorage->getToken();

        $user = $token->getUser();

        return $this->json([
            'message' => sprintf('Welcome to your new controller %s!', $user->getEmail()),
            'path' => 'src/Controller/HomeController.php',
        ]);
    }
}
