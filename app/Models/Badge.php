<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Badge extends Model
{
    protected $fillable = [
        'slug',
        'name_key',
        'description_key',
        'icon',
        'criteria_type',
        'criteria_value',
        'sort_order',
    ];

    protected $casts = [
        'criteria_value' => 'array',
    ];

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'badge_user')
            ->withPivot('earned_at')
            ->withTimestamps();
    }

    public function hasUser(User $user): bool
    {
        return $this->users()->where('user_id', $user->id)->exists();
    }
}
