<?php

namespace App\Entity;

use App\Repository\LoyaltyPointsRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: LoyaltyPointsRepository::class)]
class LoyaltyPoints
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::BIGINT, nullable: true)]
    private ?string $pointsBalance = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTime $createdAt = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTime $updatedAt = null;

    #[ORM\ManyToOne(inversedBy: 'loyaltyPoints')]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $user = null;

    #[ORM\ManyToOne(inversedBy: 'loyaltyPoints')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Shop $shop = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getPointsBalance(): ?string
    {
        return $this->pointsBalance;
    }

    public function setPointsBalance(?string $pointsBalance): static
    {
        $this->pointsBalance = $pointsBalance;

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

    public function getUpdatedAt(): ?\DateTime
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(?\DateTime $updatedAt): static
    {
        $this->updatedAt = $updatedAt;

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
