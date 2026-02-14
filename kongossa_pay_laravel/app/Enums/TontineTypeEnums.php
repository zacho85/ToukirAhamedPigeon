<?php

namespace App\Enums;

enum TontineTypeEnums: string
{
    case FRIEND_CIRCLE = 'friends';
    case FAMILY_FUND = 'family';
    case SAVINGS_GROUP = 'savings';
    case INVESTMENT_POOL = 'investment';

    public function label(): string
    {
        return match ($this) {
            self::FRIEND_CIRCLE => 'Friend Circle',
            self::FAMILY_FUND => 'Family Fund',
            self::SAVINGS_GROUP => 'Savings Group',
            self::INVESTMENT_POOL => 'Investment Pool',
        };
    }

    public function description(): string
    {
        return match ($this) {
            self::FRIEND_CIRCLE => 'Casual savings with friends',
            self::FAMILY_FUND => 'Family-based financial support',
            self::SAVINGS_GROUP => 'Focused on collective savings goals',
            self::INVESTMENT_POOL => 'Investment-focused collaboration',
        };
    }

    public function toArray(): array
    {
        return [
            'label' => $this->label(),
            'value' => $this->value,
            'description' => $this->description(),
        ];
    }
}
