<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250616110852 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE TABLE campaign_participation (id INT AUTO_INCREMENT NOT NULL, user_id_id INT NOT NULL, campaign_id INT NOT NULL, is_active TINYINT(1) DEFAULT NULL, INDEX IDX_6A694F359D86650F (user_id_id), INDEX IDX_6A694F35F639F774 (campaign_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE loyalty_campaign (id INT AUTO_INCREMENT NOT NULL, shop_id_id INT NOT NULL, name VARCHAR(100) DEFAULT NULL, description VARCHAR(255) DEFAULT NULL, rules VARCHAR(255) DEFAULT NULL, start_date DATETIME DEFAULT NULL, en_date DATETIME DEFAULT NULL, campaign_type VARCHAR(255) DEFAULT NULL, campaign_id INT NOT NULL, INDEX IDX_4D113103B852C405 (shop_id_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE loyalty_points (id INT AUTO_INCREMENT NOT NULL, user_id_id INT NOT NULL, shop_id_id INT NOT NULL, points_balance BIGINT DEFAULT NULL, created_at DATETIME DEFAULT NULL, updated_at DATETIME DEFAULT NULL, INDEX IDX_E0C7D07D9D86650F (user_id_id), INDEX IDX_E0C7D07DB852C405 (shop_id_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE reward (id INT AUTO_INCREMENT NOT NULL, shop_id_id INT DEFAULT NULL, reward_id INT NOT NULL, description VARCHAR(255) DEFAULT NULL, points_cost INT DEFAULT NULL, quantity_available INT DEFAULT NULL, is_active TINYINT(1) DEFAULT NULL, created_at DATETIME DEFAULT NULL, INDEX IDX_4ED17253B852C405 (shop_id_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE reward_exchange (id INT AUTO_INCREMENT NOT NULL, user_id_id INT NOT NULL, reward_id_id INT NOT NULL, date_exchange DATETIME DEFAULT NULL, INDEX IDX_60B77DAA9D86650F (user_id_id), INDEX IDX_60B77DAA1898C50B (reward_id_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE shop (id INT AUTO_INCREMENT NOT NULL, shop_id INT NOT NULL, name VARCHAR(255) DEFAULT NULL, phone INT DEFAULT NULL, address VARCHAR(255) DEFAULT NULL, created_at DATETIME DEFAULT NULL, updated_at DATETIME DEFAULT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE transaction (id INT AUTO_INCREMENT NOT NULL, reward_id_id INT NOT NULL, user_id_id INT NOT NULL, shop_id_id INT NOT NULL, transaction_id INT NOT NULL, transaction_date DATETIME DEFAULT NULL, operation_type VARCHAR(100) DEFAULT NULL, point_amount INT DEFAULT NULL, created_at DATETIME DEFAULT NULL, INDEX IDX_723705D11898C50B (reward_id_id), INDEX IDX_723705D19D86650F (user_id_id), INDEX IDX_723705D1B852C405 (shop_id_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE campaign_participation ADD CONSTRAINT FK_6A694F359D86650F FOREIGN KEY (user_id_id) REFERENCES user (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE campaign_participation ADD CONSTRAINT FK_6A694F35F639F774 FOREIGN KEY (campaign_id) REFERENCES loyalty_campaign (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE loyalty_campaign ADD CONSTRAINT FK_4D113103B852C405 FOREIGN KEY (shop_id_id) REFERENCES shop (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE loyalty_points ADD CONSTRAINT FK_E0C7D07D9D86650F FOREIGN KEY (user_id_id) REFERENCES user (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE loyalty_points ADD CONSTRAINT FK_E0C7D07DB852C405 FOREIGN KEY (shop_id_id) REFERENCES shop (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE reward ADD CONSTRAINT FK_4ED17253B852C405 FOREIGN KEY (shop_id_id) REFERENCES shop (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE reward_exchange ADD CONSTRAINT FK_60B77DAA9D86650F FOREIGN KEY (user_id_id) REFERENCES user (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE reward_exchange ADD CONSTRAINT FK_60B77DAA1898C50B FOREIGN KEY (reward_id_id) REFERENCES reward (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE transaction ADD CONSTRAINT FK_723705D11898C50B FOREIGN KEY (reward_id_id) REFERENCES reward (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE transaction ADD CONSTRAINT FK_723705D19D86650F FOREIGN KEY (user_id_id) REFERENCES user (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE transaction ADD CONSTRAINT FK_723705D1B852C405 FOREIGN KEY (shop_id_id) REFERENCES shop (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE user ADD firstname VARCHAR(255) NOT NULL, ADD lastname VARCHAR(255) NOT NULL, ADD phone INT DEFAULT NULL, ADD qr_code VARCHAR(255) DEFAULT NULL, ADD gpdr_accepted_at DATETIME DEFAULT NULL, ADD created_at DATETIME DEFAULT NULL, ADD updated_at DATETIME DEFAULT NULL
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE campaign_participation DROP FOREIGN KEY FK_6A694F359D86650F
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE campaign_participation DROP FOREIGN KEY FK_6A694F35F639F774
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE loyalty_campaign DROP FOREIGN KEY FK_4D113103B852C405
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE loyalty_points DROP FOREIGN KEY FK_E0C7D07D9D86650F
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE loyalty_points DROP FOREIGN KEY FK_E0C7D07DB852C405
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE reward DROP FOREIGN KEY FK_4ED17253B852C405
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE reward_exchange DROP FOREIGN KEY FK_60B77DAA9D86650F
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE reward_exchange DROP FOREIGN KEY FK_60B77DAA1898C50B
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE transaction DROP FOREIGN KEY FK_723705D11898C50B
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE transaction DROP FOREIGN KEY FK_723705D19D86650F
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE transaction DROP FOREIGN KEY FK_723705D1B852C405
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE campaign_participation
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE loyalty_campaign
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE loyalty_points
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE reward
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE reward_exchange
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE shop
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE transaction
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE user DROP firstname, DROP lastname, DROP phone, DROP qr_code, DROP gpdr_accepted_at, DROP created_at, DROP updated_at
        SQL);
    }
}
