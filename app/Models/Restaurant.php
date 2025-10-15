<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
class Restaurant extends Model
{
    use HasFactory;
    protected $fillable = [
        'name',
        'city',
        'cuisine',
        'rating',
    ];

    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}
