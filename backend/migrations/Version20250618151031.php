<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250618151031 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE reward ADD name VARCHAR(150) NOT NULL
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE reward_exchange ADD exchange_code VARCHAR(20) NOT NULL, ADD status VARCHAR(20) NOT NULL, ADD used_at DATETIME DEFAULT NULL, ADD expires_at DATETIME NOT NULL, ADD qr_code LONGTEXT DEFAULT NULL
        SQL);
        $this->addSql(<<<'SQL'
            CREATE UNIQUE INDEX UNIQ_60B77DAA41AB100A ON reward_exchange (exchange_code)
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE reward DROP name
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX UNIQ_60B77DAA41AB100A ON reward_exchange
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE reward_exchange DROP exchange_code, DROP status, DROP used_at, DROP expires_at, DROP qr_code
        SQL);
    }
}
