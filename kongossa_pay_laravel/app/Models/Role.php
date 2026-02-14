<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Rez1pro\UserAccess\Traits\HasPermission;

class Role extends Model
{
    use HasPermission;

    protected $fillable = ['name'];

    public function users()
    {
        return $this->hasMany(User::class);
    }
}