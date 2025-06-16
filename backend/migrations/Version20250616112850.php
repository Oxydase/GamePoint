<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250616112850 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE campaign_participation DROP FOREIGN KEY FK_6A694F359D86650F
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX IDX_6A694F359D86650F ON campaign_participation
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE campaign_participation CHANGE user_id_id user_id INT NOT NULL
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE campaign_participation ADD CONSTRAINT FK_6A694F35A76ED395 FOREIGN KEY (user_id) REFERENCES user (id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_6A694F35A76ED395 ON campaign_participation (user_id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE loyalty_campaign DROP FOREIGN KEY FK_4D113103B852C405
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX IDX_4D113103B852C405 ON loyalty_campaign
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE loyalty_campaign CHANGE shop_id_id shop_id INT NOT NULL
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE loyalty_campaign ADD CONSTRAINT FK_4D1131034D16C4DD FOREIGN KEY (shop_id) REFERENCES shop (id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_4D1131034D16C4DD ON loyalty_campaign (shop_id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE loyalty_points DROP FOREIGN KEY FK_E0C7D07DB852C405
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX IDX_E0C7D07DB852C405 ON loyalty_points
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE loyalty_points CHANGE shop_id_id shop_id INT NOT NULL
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE loyalty_points ADD CONSTRAINT FK_E0C7D07D4D16C4DD FOREIGN KEY (shop_id) REFERENCES shop (id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_E0C7D07D4D16C4DD ON loyalty_points (shop_id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE reward DROP FOREIGN KEY FK_4ED17253B852C405
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX IDX_4ED17253B852C405 ON reward
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE reward CHANGE shop_id_id shop_id INT DEFAULT NULL
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE reward ADD CONSTRAINT FK_4ED172534D16C4DD FOREIGN KEY (shop_id) REFERENCES shop (id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_4ED172534D16C4DD ON reward (shop_id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE reward_exchange DROP FOREIGN KEY FK_60B77DAA1898C50B
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE reward_exchange DROP FOREIGN KEY FK_60B77DAA9D86650F
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX IDX_60B77DAA1898C50B ON reward_exchange
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX IDX_60B77DAA9D86650F ON reward_exchange
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE reward_exchange ADD user_id INT NOT NULL, ADD reward_id INT NOT NULL, DROP user_id_id, DROP reward_id_id
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE reward_exchange ADD CONSTRAINT FK_60B77DAAA76ED395 FOREIGN KEY (user_id) REFERENCES user (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE reward_exchange ADD CONSTRAINT FK_60B77DAAE466ACA1 FOREIGN KEY (reward_id) REFERENCES reward (id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_60B77DAAA76ED395 ON reward_exchange (user_id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_60B77DAAE466ACA1 ON reward_exchange (reward_id)
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
            DROP INDEX IDX_723705D11898C50B ON transaction
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX IDX_723705D19D86650F ON transaction
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX IDX_723705D1B852C405 ON transaction
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE transaction ADD reward_id INT NOT NULL, ADD user_id INT NOT NULL, ADD shop_id INT NOT NULL, DROP reward_id_id, DROP user_id_id, DROP shop_id_id
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE transaction ADD CONSTRAINT FK_723705D1E466ACA1 FOREIGN KEY (reward_id) REFERENCES reward (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE transaction ADD CONSTRAINT FK_723705D1A76ED395 FOREIGN KEY (user_id) REFERENCES user (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE transaction ADD CONSTRAINT FK_723705D14D16C4DD FOREIGN KEY (shop_id) REFERENCES shop (id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_723705D1E466ACA1 ON transaction (reward_id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_723705D1A76ED395 ON transaction (user_id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_723705D14D16C4DD ON transaction (shop_id)
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE campaign_participation DROP FOREIGN KEY FK_6A694F35A76ED395
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX IDX_6A694F35A76ED395 ON campaign_participation
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE campaign_participation CHANGE user_id user_id_id INT NOT NULL
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE campaign_participation ADD CONSTRAINT FK_6A694F359D86650F FOREIGN KEY (user_id_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE NO ACTION
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_6A694F359D86650F ON campaign_participation (user_id_id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE loyalty_points DROP FOREIGN KEY FK_E0C7D07D4D16C4DD
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX IDX_E0C7D07D4D16C4DD ON loyalty_points
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE loyalty_points CHANGE shop_id shop_id_id INT NOT NULL
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE loyalty_points ADD CONSTRAINT FK_E0C7D07DB852C405 FOREIGN KEY (shop_id_id) REFERENCES shop (id) ON UPDATE NO ACTION ON DELETE NO ACTION
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_E0C7D07DB852C405 ON loyalty_points (shop_id_id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE reward DROP FOREIGN KEY FK_4ED172534D16C4DD
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX IDX_4ED172534D16C4DD ON reward
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE reward CHANGE shop_id shop_id_id INT DEFAULT NULL
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE reward ADD CONSTRAINT FK_4ED17253B852C405 FOREIGN KEY (shop_id_id) REFERENCES shop (id) ON UPDATE NO ACTION ON DELETE NO ACTION
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_4ED17253B852C405 ON reward (shop_id_id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE reward_exchange DROP FOREIGN KEY FK_60B77DAAA76ED395
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE reward_exchange DROP FOREIGN KEY FK_60B77DAAE466ACA1
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX IDX_60B77DAAA76ED395 ON reward_exchange
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX IDX_60B77DAAE466ACA1 ON reward_exchange
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE reward_exchange ADD user_id_id INT NOT NULL, ADD reward_id_id INT NOT NULL, DROP user_id, DROP reward_id
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE reward_exchange ADD CONSTRAINT FK_60B77DAA1898C50B FOREIGN KEY (reward_id_id) REFERENCES reward (id) ON UPDATE NO ACTION ON DELETE NO ACTION
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE reward_exchange ADD CONSTRAINT FK_60B77DAA9D86650F FOREIGN KEY (user_id_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE NO ACTION
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_60B77DAA1898C50B ON reward_exchange (reward_id_id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_60B77DAA9D86650F ON reward_exchange (user_id_id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE loyalty_campaign DROP FOREIGN KEY FK_4D1131034D16C4DD
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX IDX_4D1131034D16C4DD ON loyalty_campaign
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE loyalty_campaign CHANGE shop_id shop_id_id INT NOT NULL
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE loyalty_campaign ADD CONSTRAINT FK_4D113103B852C405 FOREIGN KEY (shop_id_id) REFERENCES shop (id) ON UPDATE NO ACTION ON DELETE NO ACTION
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_4D113103B852C405 ON loyalty_campaign (shop_id_id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE transaction DROP FOREIGN KEY FK_723705D1E466ACA1
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE transaction DROP FOREIGN KEY FK_723705D1A76ED395
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE transaction DROP FOREIGN KEY FK_723705D14D16C4DD
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX IDX_723705D1E466ACA1 ON transaction
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX IDX_723705D1A76ED395 ON transaction
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX IDX_723705D14D16C4DD ON transaction
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE transaction ADD reward_id_id INT NOT NULL, ADD user_id_id INT NOT NULL, ADD shop_id_id INT NOT NULL, DROP reward_id, DROP user_id, DROP shop_id
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE transaction ADD CONSTRAINT FK_723705D11898C50B FOREIGN KEY (reward_id_id) REFERENCES reward (id) ON UPDATE NO ACTION ON DELETE NO ACTION
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE transaction ADD CONSTRAINT FK_723705D19D86650F FOREIGN KEY (user_id_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE NO ACTION
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE transaction ADD CONSTRAINT FK_723705D1B852C405 FOREIGN KEY (shop_id_id) REFERENCES shop (id) ON UPDATE NO ACTION ON DELETE NO ACTION
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_723705D11898C50B ON transaction (reward_id_id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_723705D19D86650F ON transaction (user_id_id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_723705D1B852C405 ON transaction (shop_id_id)
        SQL);
    }
}
