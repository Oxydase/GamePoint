<?php

namespace App\Entity;

use App\Repository\RewardExchangeRepository;
use Doctrine\ORM\Mapping as ORM;

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
}
