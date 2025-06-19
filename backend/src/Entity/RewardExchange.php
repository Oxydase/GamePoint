<?php

namespace App\Entity;

use App\Repository\RewardExchangeRepository;
use Doctrine\ORM\Mapping as ORM;
use Ramsey\Uuid\Uuid;
use Doctrine\DBAL\Types\Types;


#[ORM\Entity(repositoryClass: RewardExchangeRepository::class)]
class RewardExchange
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTime $dateExchange = null;

    #[ORM\ManyToOne(inversedBy: 'rewardExchanges')]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $user = null;

    #[ORM\ManyToOne(inversedBy: 'rewardExchanges')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Reward $reward = null;


    #[ORM\Column(length: 20, unique: true)]
    private ?string $exchangeCode = null;

    #[ORM\Column(length: 20)]
    private string $status = 'pending'; 

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $usedAt = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $expiresAt = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $qrCode = null; 

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getDateExchange(): ?\DateTime
    {
        return $this->dateExchange;
    }

    public function setDateExchange(?\DateTime $dateExchange): static
    {
        $this->dateExchange = $dateExchange;

        return $this;
    }

    public function getUserId(): ?User
    {
        return $this->user;
    }

    public function setUserId(?User $user): static
    {
        $this->user = $user;

        return $this;
    }

    public function getRewardId(): ?Reward
    {
        return $this->reward;
    }

    public function setRewardId(?Reward $reward): static
    {
        $this->reward = $reward;

        return $this;
    }


        public function __construct()
    {
        $this->dateExchange = new \DateTime();
        $this->exchangeCode = $this->generateExchangeCode();
        $this->expiresAt = (new \DateTime())->modify('+24 hours');
        $this->qrCode = Uuid::uuid4()->toString(); 
    }

    private function generateExchangeCode(): string
    {
        return sprintf('RWD-%s-%s-%s', 
            date('Y'),
            strtoupper(substr(bin2hex(random_bytes(2)), 0, 4)),
            strtoupper(substr(bin2hex(random_bytes(2)), 0, 4))
        );
    }


     public function getQrCode(): ?string
    {
        return $this->qrCode;
    }

    public function setQrCode(?string $qrCode): static
    {
        $this->qrCode = $qrCode;

        return $this;
    }

        public function getExchangeCode(): ?string
    {
        return $this->exchangeCode;
    }

    public function setExchangeCode(?string $exchangeCode): static
    {
        $this->exchangeCode = $exchangeCode;

        return $this;
    }

    public function getStatus(): ?string
    {
        return $this->status;
    }
    public function setStatus(string $status): static
    {
        $this->status = $status;

        return $this;
    }
    public function getUsedAt(): ?\DateTimeInterface
    {
        return $this->usedAt;
    }
    public function setUsedAt(?\DateTimeInterface $usedAt): static
    {
        $this->usedAt = $usedAt;

        return $this;
    }
    public function getExpiresAt(): ?\DateTimeInterface
    {
        return $this->expiresAt;
    }
    public function setExpiresAt(?\DateTimeInterface $expiresAt): static
    {
        $this->expiresAt = $expiresAt;

        return $this;
    }

}
