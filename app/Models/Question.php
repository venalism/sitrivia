<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    use HasFactory;

    protected $fillable = ['quiz_id', 'text', 'options', 'correct_answer'];

    public function quiz()
    {
        return $this->belongsTo(Quiz::class);
    }
}
