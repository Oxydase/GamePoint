<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250616113422 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE loyalty_campaign DROP campaign_id
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE reward DROP reward_id
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE shop DROP shop_id
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE loyalty_campaign ADD campaign_id INT NOT NULL
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE reward ADD reward_id INT NOT NULL
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE shop ADD shop_id INT NOT NULL
        SQL);
    }
}
