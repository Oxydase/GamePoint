<?php

namespace App\Entity;

use App\Repository\ShopRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ShopRepository::class)]
class Shop
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;



    #[ORM\Column(length: 255, nullable: true)]
    private ?string $name = null;

    #[ORM\Column(nullable: true)]
    private ?int $phone = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $address = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTime $createdAt = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTime $updatedAt = null;

    /**
     * @var Collection<int, Reward>
     */
    #[ORM\OneToMany(targetEntity: Reward::class, mappedBy: 'shop_id')]
    private Collection $rewards;

    /**
     * @var Collection<int, LoyaltyCampaign>
     */
    #[ORM\OneToMany(targetEntity: LoyaltyCampaign::class, mappedBy: 'shop_id')]
    private Collection $loyaltyCampaigns;

    /**
     * @var Collection<int, Transaction>
     */
    #[ORM\OneToMany(targetEntity: Transaction::class, mappedBy: 'shop_id')]
    private Collection $transactions;

    /**
     * @var Collection<int, LoyaltyPoints>
     */
    #[ORM\OneToMany(targetEntity: LoyaltyPoints::class, mappedBy: 'shop_id')]
    private Collection $loyaltyPoints;

    public function __construct()
    {
        $this->rewards = new ArrayCollection();
        $this->loyaltyCampaigns = new ArrayCollection();
        $this->transactions = new ArrayCollection();
        $this->loyaltyPoints = new ArrayCollection();
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

    public function getPhone(): ?int
    {
        return $this->phone;
    }

    public function setPhone(?int $phone): static
    {
        $this->phone = $phone;

        return $this;
    }

    public function getAddress(): ?string
    {
        return $this->address;
    }

    public function setAddress(?string $address): static
    {
        $this->address = $address;

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

    /**
     * @return Collection<int, Reward>
     */
    public function getRewards(): Collection
    {
        return $this->rewards;
    }

    public function addReward(Reward $reward): static
    {
        if (!$this->rewards->contains($reward)) {
            $this->rewards->add($reward);
            $reward->setShopId($this);
        }

        return $this;
    }

    public function removeReward(Reward $reward): static
    {
        if ($this->rewards->removeElement($reward)) {
            // set the owning side to null (unless already changed)
            if ($reward->getShopId() === $this) {
                $reward->setShopId(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, LoyaltyCampaign>
     */
    public function getLoyaltyCampaigns(): Collection
    {
        return $this->loyaltyCampaigns;
    }

    public function addLoyaltyCampaign(LoyaltyCampaign $loyaltyCampaign): static
    {
        if (!$this->loyaltyCampaigns->contains($loyaltyCampaign)) {
            $this->loyaltyCampaigns->add($loyaltyCampaign);
            $loyaltyCampaign->setShopId($this);
        }

        return $this;
    }

    public function removeLoyaltyCampaign(LoyaltyCampaign $loyaltyCampaign): static
    {
        if ($this->loyaltyCampaigns->removeElement($loyaltyCampaign)) {
            // set the owning side to null (unless already changed)
            if ($loyaltyCampaign->getShopId() === $this) {
                $loyaltyCampaign->setShopId(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Transaction>
     */
    public function getTransactions(): Collection
    {
        return $this->transactions;
    }

    public function addTransaction(Transaction $transaction): static
    {
        if (!$this->transactions->contains($transaction)) {
            $this->transactions->add($transaction);
            $transaction->setShopId($this);
        }

        return $this;
    }

    public function removeTransaction(Transaction $transaction): static
    {
        if ($this->transactions->removeElement($transaction)) {
            // set the owning side to null (unless already changed)
            if ($transaction->getShopId() === $this) {
                $transaction->setShopId(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, LoyaltyPoints>
     */
    public function getLoyaltyPoints(): Collection
    {
        return $this->loyaltyPoints;
    }

    public function addLoyaltyPoint(LoyaltyPoints $loyaltyPoint): static
    {
        if (!$this->loyaltyPoints->contains($loyaltyPoint)) {
            $this->loyaltyPoints->add($loyaltyPoint);
            $loyaltyPoint->setShopId($this);
        }

        return $this;
    }

    public function removeLoyaltyPoint(LoyaltyPoints $loyaltyPoint): static
    {
        if ($this->loyaltyPoints->removeElement($loyaltyPoint)) {
            // set the owning side to null (unless already changed)
            if ($loyaltyPoint->getShopId() === $this) {
                $loyaltyPoint->setShopId(null);
            }
        }

        return $this;
    }
}
