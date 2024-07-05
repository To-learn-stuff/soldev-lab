use anchor_lang::prelude::*;

declare_id!("Bpudj9WBG2yvkCwD6cfoL5uryWYZRDKuaCgoQBNGxiqy");

#[program]
pub mod temp_project {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
