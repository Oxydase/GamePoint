<?php

namespace App\Entity;

use App\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\UniqueConstraint(name: 'UNIQ_IDENTIFIER_EMAIL', fields: ['email'])]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 180)]
    private ?string $email = null;

    /**
     * @var list<string> The user roles
     */
    #[ORM\Column]
    private array $roles = [];

    /**
     * @var string The hashed password
     */
    #[ORM\Column]
    private ?string $password = null;

    #[ORM\Column(length: 255)]
    private ?string $firstname = null;

    #[ORM\Column(length: 255)]
    private ?string $lastname = null;

    #[ORM\Column(nullable: true)]
    private ?int $phone = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $qrCode = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTime $gpdrAcceptedAt = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTime $createdAt = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTime $updatedAt = null;

    /**
     * @var Collection<int, Transaction>
     */
    #[ORM\OneToMany(targetEntity: Transaction::class, mappedBy: 'user_id')]
    private Collection $transactions;

    /**
     * @var Collection<int, LoyaltyPoints>
     */
    #[ORM\OneToMany(targetEntity: LoyaltyPoints::class, mappedBy: 'user_id')]
    private Collection $loyaltyPoints;

    /**
     * @var Collection<int, CampaignParticipation>
     */
    #[ORM\OneToMany(targetEntity: CampaignParticipation::class, mappedBy: 'user_id')]
    private Collection $campaignParticipations;

    /**
     * @var Collection<int, RewardExchange>
     */
    #[ORM\OneToMany(targetEntity: RewardExchange::class, mappedBy: 'user_id')]
    private Collection $rewardExchanges;

    public function __construct()
    {
        $this->transactions = new ArrayCollection();
        $this->loyaltyPoints = new ArrayCollection();
        $this->campaignParticipations = new ArrayCollection();
        $this->rewardExchanges = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;

        return $this;
    }

    /**
     * A visual identifier that represents this user.
     *
     * @see UserInterface
     */
    public function getUserIdentifier(): string
    {
        return (string) $this->email;
    }

    /**
     * @see UserInterface
     */
    public function getRoles(): array
    {
        $roles = $this->roles;
        // guarantee every user at least has ROLE_USER
        $roles[] = 'ROLE_USER';

        return array_unique($roles);
    }

    /**
     * @param list<string> $roles
     */
    public function setRoles(array $roles): static
    {
        $this->roles = $roles;

        return $this;
    }

    /**
     * @see PasswordAuthenticatedUserInterface
     */
    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(string $password): static
    {
        $this->password = $password;

        return $this;
    }

    /**
     * @see UserInterface
     */
    public function eraseCredentials(): void
    {
        // If you store any temporary, sensitive data on the user, clear it here
        // $this->plainPassword = null;
    }

    public function getFirstname(): ?string
    {
        return $this->firstname;
    }

    public function setFirstname(string $firstname): static
    {
        $this->firstname = $firstname;

        return $this;
    }

    public function getLastname(): ?string
    {
        return $this->lastname;
    }

    public function setLastname(string $lastname): static
    {
        $this->lastname = $lastname;

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

    public function getQrCode(): ?string
    {
        return $this->qrCode;
    }

    public function setQrCode(?string $qrCode): static
    {
        $this->qrCode = $qrCode;

        return $this;
    }

    public function getGpdrAcceptedAt(): ?\DateTime
    {
        return $this->gpdrAcceptedAt;
    }

    public function setGpdrAcceptedAt(?\DateTime $gpdrAcceptedAt): static
    {
        $this->gpdrAcceptedAt = $gpdrAcceptedAt;

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
            $transaction->setUserId($this);
        }

        return $this;
    }

    public function removeTransaction(Transaction $transaction): static
    {
        if ($this->transactions->removeElement($transaction)) {
            // set the owning side to null (unless already changed)
            if ($transaction->getUserId() === $this) {
                $transaction->setUserId(null);
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
            $loyaltyPoint->setUserId($this);
        }

        return $this;
    }

    public function removeLoyaltyPoint(LoyaltyPoints $loyaltyPoint): static
    {
        if ($this->loyaltyPoints->removeElement($loyaltyPoint)) {
            // set the owning side to null (unless already changed)
            if ($loyaltyPoint->getUserId() === $this) {
                $loyaltyPoint->setUserId(null);
            }
        }

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
            $campaignParticipation->setUserId($this);
        }

        return $this;
    }

    public function removeCampaignParticipation(CampaignParticipation $campaignParticipation): static
    {
        if ($this->campaignParticipations->removeElement($campaignParticipation)) {
            // set the owning side to null (unless already changed)
            if ($campaignParticipation->getUserId() === $this) {
                $campaignParticipation->setUserId(null);
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
            $rewardExchange->setUserId($this);
        }

        return $this;
    }

    public function removeRewardExchange(RewardExchange $rewardExchange): static
    {
        if ($this->rewardExchanges->removeElement($rewardExchange)) {
            // set the owning side to null (unless already changed)
            if ($rewardExchange->getUserId() === $this) {
                $rewardExchange->setUserId(null);
            }
        }

        return $this;
    }
}
