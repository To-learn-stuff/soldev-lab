use anchor_lang::prelude::*;

declare_id!("9ciAHt6rxGgxQ4P9TLydJNzvARfemNxU9HviV1hUjKcF");

#[program]
pub mod anchor_movie_review_program {
    use super::*;

    pub fn add_movie_review(
        ctx: Context<AddMovieReview>,
        title: String,
        description: String,
        rating: u8,
    ) -> Result<()>{
        msg!("Movie Review Account Created");
        msg!("Title: {}", title);
        msg!("Description: {}", description);
        msg!("Rating: {}", rating);

        let movie_review = &mut ctx.accounts.movie_review;
        movie_review.reviewer = ctx.accounts.initializer.key();
        movie_review.title = title;
        movie_review.description = description;
        movie_review.rating = rating;
        Ok(())
    }

    pub fn update_movie_review(
        ctx: Context<UpdateMovieReview>,
        title: String,
        description: String,
        rating: u8,
    ) -> Result<()> {
        msg!("Movie review account space reallocated");
        msg!("Title: {}", title);
        msg!("Description: {}", description);
        msg!("Rating: {}", rating);

        let movie_review = &mut ctx.accounts.movie_review;
        movie_review.rating = rating;
        movie_review.description = description;

        Ok(())
    }


    pub fn delete_movie_review(_ctx: Context<DeleteMovieReview>, title: String) -> Result<()> {
        msg!("Movie review for {} deleted", title);
        Ok(())
    }

}

#[account]
pub struct MovieAccountState{
    pub reviewer: Pubkey,
    pub rating: u8,
    pub title: String,
    pub description: String,
}

impl Space for MovieAccountState {
    const INIT_SPACE: usize = 8 + 32 + 1 + 4 + 4;
}

    
#[derive(Accounts)]
#[instruction(title: String, description: String)]
pub struct  AddMovieReview<'info>{
    #[account(
        init, 
        seeds=[title.as_bytes(),initializer.key().as_ref()], 
        bump ,
        payer=initializer,
        space= MovieAccountState::INIT_SPACE+title.len()+description.len(),
    )]
    pub movie_review: Account<'info, MovieAccountState>,
    #[account(mut)]
    pub initializer: Signer<'info>,
    pub system_program: Program<'info, System>,
}




#[derive(Accounts)]
#[instruction(title: String, description: String)]
pub struct  UpdateMovieReview<'info>{
    #[account(
        mut, 
        seeds=[title.as_bytes(),initializer.key().as_ref()], 
        bump ,
        realloc = MovieAccountState::INIT_SPACE+title.len()+description.len(),
        realloc::payer=initializer,
        realloc::zero=true,
    )]
    pub movie_review: Account<'info, MovieAccountState>,
    #[account(mut)]
    pub initializer: Signer<'info>,
    pub system_program: Program<'info, System>,
}




#[derive(Accounts)]
#[instruction(title: String)]
pub struct DeleteMovieReview<'info>{
    #[account(
        mut, 
        seeds=[title.as_bytes(),initializer.key().as_ref()], 
        bump ,
        close=initializer
    )]
    pub movie_review: Account<'info, MovieAccountState>,
    #[account(mut)]
    pub initializer: Signer<'info>,
    pub system_program: Program<'info, System>,
}