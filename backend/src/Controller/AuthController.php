<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Twig\Environment;
use Symfony\Component\Mime\Part\DataPart;
use Symfony\Component\Mime\Part\File;


use App\Service\QrCodeService;

final class AuthController extends AbstractController
{
    #[Route('/api/register', name: 'app_register', methods: ['POST'])]
    public function register(
        Request $request,
        UserPasswordHasherInterface $passwordHasher,
        ValidatorInterface $validator,
        EntityManagerInterface $entityManager,
        UserRepository $userRepository,
        MailerInterface $mailer,
        Environment $twig
    ): JsonResponse {
        // recuperation des donnée JSON 
        $data = json_decode($request->getContent(), true);

        // nouveau user
        $user = new User();
        $user->setEmail($data['email']);
        $user->setFirstname($data['firstname']);
        $user->setLastname($data['lastname']);
        $user->setPhone($data['phone']?? null);

        // hash du mot de passe
        $hashedPassword = $passwordHasher->hashPassword(
            $user, 
            $data['password']
        );
        $user->setPassword($hashedPassword);

        $errors = $validator->validate($user);
        if(count($errors) > 0) {
    
            return $this->json(['erros' => (string) $errors], 400);
        }

        // sauvegarde

        $entityManager->persist($user);
        $entityManager->flush();

        // Envoi d'email de bienvenues 

        $emailContent = $twig->render('emails/welcome.html.twig', [
            'firstname' => $user->getFirstname(),
            'lastname' => $user->getLastname(),
            'email' => $user->getEmail(),
            // 'created_at' => $user->getCreatedAt()
        ]);

        // Création de l'email avec logo
        $email = (new Email())
            ->from('gamepoint3msm@gmail.com')
            ->to($user->getEmail())
            ->subject('🎮 Bienvenue sur GamePoint !')
            ->html($emailContent)
            ->embed(fopen($this->getParameter('kernel.project_dir').'/public/images/logo.png', 'r'), 'logo');

        try {
            $mailer->send($email);
            $emailSent = true;
        } catch (\Exception $e) {
         
            $emailSent = false;
             return $this->json(['error' => $e->getMessage()], 500);
        }

        return $this->json([
            'message' => 'Compte créé avec succès, vous allez recevoir un email de confirmation',
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'firstname' => $user->getFirstname(),
                'lastname' => $user->getLastname(),
                'roles' => $user->getRoles()
            ]
        ], 201);
    }


    #[Route('/api/user/qr-code', name: 'api_user_qr_code', methods: ['GET'])]
    public function getUserQrCode(QrCodeService $qrCodeService): JsonResponse
    {
      
        $user = $this-> getUser();
        if (!$user) {
            return $this->json(['error' => 'Utilisateur non authentifié'], 401);

        }

        $qrCodeImage = $qrCodeService->generateQrCodeImage(
            $user->getQrCode()
        );

        return $this->json([
            'qr_Code_data' => $user->getQrCode(),
            'qr_code_image' => 'data:image/png;base64,' . $qrCodeImage,
            'user' => [
            'firstname' => $user->getFirstname(),
            'lastname' => $user->getLastname()
        ]
        ]);
    }
}
