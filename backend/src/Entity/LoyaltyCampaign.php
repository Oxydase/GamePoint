<?php

namespace App\Entity;

use App\Repository\LoyaltyCampaignRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: LoyaltyCampaignRepository::class)]
class LoyaltyCampaign
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 100, nullable: true)]
    private ?string $name = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $description = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $rules = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTime $startDate = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTime $enDate = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $campaignType = null;



    #[ORM\ManyToOne(inversedBy: 'loyaltyCampaigns')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Shop $shop = null;

    /**
     * @var Collection<int, CampaignParticipation>
     */
    #[ORM\OneToMany(targetEntity: CampaignParticipation::class, mappedBy: 'campaign')]
    private Collection $campaignParticipations;

    public function __construct()
    {
        $this->campaignParticipations = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(?string $name): static
    {
        $this->name = $name;

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): static
    {
        $this->description = $description;

        return $this;
    }

    public function getRules(): ?string
    {
        return $this->rules;
    }

    public function setRules(?string $rules): static
    {
        $this->rules = $rules;

        return $this;
    }

    public function getStartDate(): ?\DateTime
    {
        return $this->startDate;
    }

    public function setStartDate(?\DateTime $startDate): static
    {
        $this->startDate = $startDate;

        return $this;
    }

    public function getEnDate(): ?\DateTime
    {
        return $this->enDate;
    }

    public function setEnDate(?\DateTime $enDate): static
    {
        $this->enDate = $enDate;

        return $this;
    }

    public function getCampaignType(): ?string
    {
        return $this->campaignType;
    }

    public function setCampaignType(?string $campaignType): static
    {
        $this->campaignType = $campaignType;

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

    /**
     * @return Collection<int, CampaignParticipation>
     */
    public function getCampaignParticipations(): Collection
    {
        return $this->campaignParticipations;
    }

    public function addCampaignParticipation(CampaignParticipation $campaignParticipation): static
    {
        if (!$this->campaignParticipations->contains($campaignParticipation)) {
            $this->campaignParticipations->add($campaignParticipation);
            $campaignParticipation->setCampaign($this);
        }

        return $this;
    }

    public function removeCampaignParticipation(CampaignParticipation $campaignParticipation): static
    {
        if ($this->campaignParticipations->removeElement($campaignParticipation)) {
            // set the owning side to null (unless already changed)
            if ($campaignParticipation->getCampaign() === $this) {
                $campaignParticipation->setCampaign(null);
            }
        }

        return $this;
    }
}
