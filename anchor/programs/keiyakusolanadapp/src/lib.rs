#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF");

#[program]
pub mod keiyakusolanadapp {
    use super::*;

  pub fn close(_ctx: Context<CloseKeiyakusolanadapp>) -> Result<()> {
    Ok(())
  }

  pub fn decrement(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.keiyakusolanadapp.count = ctx.accounts.keiyakusolanadapp.count.checked_sub(1).unwrap();
    Ok(())
  }

  pub fn increment(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.keiyakusolanadapp.count = ctx.accounts.keiyakusolanadapp.count.checked_add(1).unwrap();
    Ok(())
  }

  pub fn initialize(_ctx: Context<InitializeKeiyakusolanadapp>) -> Result<()> {
    Ok(())
  }

  pub fn set(ctx: Context<Update>, value: u8) -> Result<()> {
    ctx.accounts.keiyakusolanadapp.count = value.clone();
    Ok(())
  }
}

#[derive(Accounts)]
pub struct InitializeKeiyakusolanadapp<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  init,
  space = 8 + Keiyakusolanadapp::INIT_SPACE,
  payer = payer
  )]
  pub keiyakusolanadapp: Account<'info, Keiyakusolanadapp>,
  pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
pub struct CloseKeiyakusolanadapp<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  mut,
  close = payer, // close account and return lamports to payer
  )]
  pub keiyakusolanadapp: Account<'info, Keiyakusolanadapp>,
}

#[derive(Accounts)]
pub struct Update<'info> {
  #[account(mut)]
  pub keiyakusolanadapp: Account<'info, Keiyakusolanadapp>,
}

#[account]
#[derive(InitSpace)]
pub struct Keiyakusolanadapp {
  count: u8,
}
