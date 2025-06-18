<?php

namespace App\Entity;

use App\Repository\RewardRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Doctrine\DBAL\Types\Types;


#[ORM\Entity(repositoryClass: RewardRepository::class)]
class Reward
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;


    #[ORM\Column(length: 150)]
    private ?string $name = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $description = null;

    #[ORM\Column(nullable: true)]
    private ?int $pointsCost = null;

    #[ORM\Column(nullable: true)]
    private ?int $quantityAvailable = null;

    #[ORM\Column(nullable: true)]
    private ?bool $isActive = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTime $createdAt = null;

    #[ORM\ManyToOne(inversedBy: 'rewards')]
    private ?Shop $shop = null;

    /**
     * @var Collection<int, Transaction>
     */
    #[ORM\OneToMany(targetEntity: Transaction::class, mappedBy: 'reward_id')]
    private Collection $transactions;

    /**
     * @var Collection<int, RewardExchange>
     */
    #[ORM\OneToMany(targetEntity: RewardExchange::class, mappedBy: 'reward_id')]
    private Collection $rewardExchanges;

    public function __construct()
    {
        $this->transactions = new ArrayCollection();
        $this->rewardExchanges = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
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

    public function getPointsCost(): ?int
    {
        return $this->pointsCost;
    }

    public function setPointsCost(?int $pointsCost): static
    {
        $this->pointsCost = $pointsCost;

        return $this;
    }

    public function getQuantityAvailable(): ?int
    {
        return $this->quantityAvailable;
    }

    public function setQuantityAvailable(?int $quantityAvailable): static
    {
        $this->quantityAvailable = $quantityAvailable;

        return $this;
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

    public function getCreatedAt(): ?\DateTime
    {
        return $this->createdAt;
    }

    public function setCreatedAt(?\DateTime $createdAt): static
    {
        $this->createdAt = $createdAt;

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
            $transaction->setRewardId($this);
        }

        return $this;
    }

    public function removeTransaction(Transaction $transaction): static
    {
        if ($this->transactions->removeElement($transaction)) {
            // set the owning side to null (unless already changed)
            if ($transaction->getRewardId() === $this) {
                $transaction->setRewardId(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, RewardExchange>
     */
    public function getRewardExchanges(): Collection
    {
        return $this->rewardExchanges;
    }

    public function addRewardExchange(RewardExchange $rewardExchange): static
    {
        if (!$this->rewardExchanges->contains($rewardExchange)) {
            $this->rewardExchanges->add($rewardExchange);
            $rewardExchange->setRewardId($this);
        }

        return $this;
    }

    public function removeRewardExchange(RewardExchange $rewardExchange): static
    {
        if ($this->rewardExchanges->removeElement($rewardExchange)) {
            // set the owning side to null (unless already changed)
            if ($rewardExchange->getRewardId() === $this) {
                $rewardExchange->setRewardId(null);
            }
        }

        return $this;
    }

            public function getName(): ?string
        {
            return $this->name;
        }

        public function setName(string $name): static
        {
            $this->name = $name;
            return $this;
        }
}
