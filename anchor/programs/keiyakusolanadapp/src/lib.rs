#![allow(clippy::result_large_err)]

pub mod instructions;
pub mod states;
pub mod errors;

use anchor_lang::prelude::*;

pub use instructions::*;
pub use states::*;

declare_id!("B1v18CkGUhUw47k2XiYYceeJ5Hri6xA75uGCofNrrr1k");

#[program]
pub mod keiyakusolanadapp {
    use super::*;

    pub fn create_vesting_account(
        ctx: Context<CreateVestingAccount>,
        company_name: String
    ) -> Result<()> {
        instructions::create_vesting::create_vesting_account(ctx, company_name)
    }

    pub fn create_employee(
        ctx: Context<CreateEmployeeAccount>,
        start_time: i64,
        end_time: i64,
        total_amount: u64,
        cliff_time: i64
    ) -> Result<()> {
        instructions::create_employee::create_employee_account(
            ctx,
            start_time,
            end_time,
            total_amount,
            cliff_time
        )
    }

    pub fn claim_tokens(ctx: Context<ClaimTokens>, _company_name: String) -> Result<()> {
        instructions::claim_tokens::claim_employee_tokens(ctx, _company_name)
    }
}
