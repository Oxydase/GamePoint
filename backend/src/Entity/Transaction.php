<?php

namespace App\Entity;

use App\Repository\TransactionRepository;
use Doctrine\ORM\Mapping as ORM;
use Doctrine\DBAL\Types\Types;

#[ORM\Entity(repositoryClass: TransactionRepository::class)]
class Transaction
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;



    #[ORM\Column(nullable: true)]
    private ?\DateTime $transactionDate = null;

    #[ORM\Column(length: 100, nullable: true)]
    private ?string $operationType = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2, nullable: true)]
    private ?string $pointAmount = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTime $createdAt = null;

    #[ORM\ManyToOne(inversedBy: 'transactions')]
    #[ORM\JoinColumn(nullable: true)]
    private ?Reward $reward = null;

    #[ORM\ManyToOne(inversedBy: 'transactions')]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $user = null;

    #[ORM\ManyToOne(inversedBy: 'transactions')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Shop $shop = null;

    public function getId(): ?int
    {
        return $this->id;
    }



    public function getTransactionDate(): ?\DateTime
    {
        return $this->transactionDate;
    }

    public function setTransactionDate(?\DateTime $transactionDate): static
    {
        $this->transactionDate = $transactionDate;

        return $this;
    }

    public function getOperationType(): ?string
    {
        return $this->operationType;
    }

    public function setOperationType(?string $operationType): static
    {
        $this->operationType = $operationType;

        return $this;
    }

    public function getPointAmount(): ?int
    {
        return $this->pointAmount;
    }

    public function setPointAmount(?int $pointAmount): static
    {
        $this->pointAmount = $pointAmount;

        return $this;
    }

    public function getCreatedAt(): ?\DateTime
    {
        return $this->createdAt;
    }

    public function setCreatedAt(?\DateTime $createdAt): static
    {
        $this->createdAt = $createdAt;

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

    public function getUserId(): ?User
    {
        return $this->user;
    }

    public function setUserId(?User $user): static
    {
        $this->user = $user;

        return $this;
    }

    public function getShopId(): ?Shop
    {
        return $this->shop;
    }

    public function setShopId(?Shop $shop): static
    {
        $this->shop = $shop;

        return $this;
    }
}
