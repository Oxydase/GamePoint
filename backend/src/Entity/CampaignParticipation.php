<?php

namespace App\Entity;

use App\Repository\CampaignParticipationRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: CampaignParticipationRepository::class)]
class CampaignParticipation
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(nullable: true)]
    private ?bool $isActive = null;

    #[ORM\ManyToOne(inversedBy: 'campaignParticipations')]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $user = null;

    #[ORM\ManyToOne(inversedBy: 'campaignParticipations')]
    #[ORM\JoinColumn(nullable: false)]
    private ?LoyaltyCampaign $campaign = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function isActive(): ?bool
    {
        return $this->isActive;
    }

    public function setIsActive(?bool $isActive): static
    {
        $this->isActive = $isActive;

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

    public function getCampaign(): ?LoyaltyCampaign
    {
        return $this->campaign;
    }

    public function setCampaign(?LoyaltyCampaign $campaign): static
    {
        $this->campaign = $campaign;

        return $this;
    }
}
