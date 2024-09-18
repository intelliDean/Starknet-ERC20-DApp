use core::starknet::ContractAddress;

#[starknet::interface]
pub trait ERC20Trait<T> {
    fn name(self: @T) -> felt252;

    fn symbol(self: @T) -> felt252;

    fn decimals(self: @T) -> u8;

    fn total_supply(self: @T) -> u256;

    fn balance_of(self: @T, account: ContractAddress) -> u256;

    fn allowance(self: @T, owner: ContractAddress, spender: ContractAddress) -> u256;

    fn owner(self: @T) -> ContractAddress;

    fn mint(ref self: T, account: ContractAddress, amount: u256);

    fn transfer(ref self: T, recipient: ContractAddress, amount: u256);

    fn transfer_from(ref self: T, owner: ContractAddress, recipient: ContractAddress, amount: u256);

    fn approve(ref self: T, spender: ContractAddress, amount: u256);

    fn burn(ref self: T, amount: u256);

    fn increase_allowance(ref self: T, spender: ContractAddress, added_amount: u256);

    fn decrease_allowance(ref self: T, spender: ContractAddress, sub_amount: u256);

    fn init_ownership(ref self: T, _pre_owner: ContractAddress);

    fn claim_ownership(ref self: T);
}

#[starknet::contract]
pub mod ERC20 {
    use core::starknet::{ContractAddress, contract_address_const, get_caller_address};
    use core::starknet::storage::{
        Map, StoragePathEntry, StoragePointerReadAccess, StoragePointerWriteAccess
    };

    #[storage]
    struct Storage {
        owner: ContractAddress,
        name: felt252,
        symbol: felt252,
        decimals: u8,
        total_supply: u256,
        balances: Map<ContractAddress, u256>,
        allowances: Map<ContractAddress, Map<ContractAddress, u256>>,
        init_owner: ContractAddress
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        Transfer: Transfer,
        Approval: Approval,
        Mint: Mint,
        Burnt: Burnt,
        Ownership: Ownership
    }

    #[derive(Drop, starknet::Event)]
    pub struct Mint {
        #[key]
        pub receiver: ContractAddress,
        pub amount: u256,
    }

    #[derive(Drop, starknet::Event)]
    pub struct Transfer {
        #[key]
        pub sender: ContractAddress,
        #[key]
        pub receiver: ContractAddress,
        pub amount: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct Approval {
        #[key]
        owner: ContractAddress,
        #[key]
        spender: ContractAddress,
        value: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct Burnt {
        #[key]
        burner: ContractAddress,
        value: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct Ownership {
        #[key]
        current_owner: ContractAddress,
        #[key]
        prev_owner: ContractAddress,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState, owner: ContractAddress, name: felt252, symbol: felt252
    ) {
        self.name.write(name);
        self.symbol.write(symbol);
        self.decimals.write(18);
        self.owner.write(owner);

        let amount = 100000;
        //this only run once so no need to add the amount to the balance
        self.balances.entry(owner).write(amount);

        self.total_supply.write(amount);

        self.emit(Mint { receiver: owner, amount: amount });
    }

    #[abi(embed_v0)]
    impl ERC20 of super::ERC20Trait<ContractState> {
        fn name(self: @ContractState) -> felt252 {
            self.name.read()
        }

        fn symbol(self: @ContractState) -> felt252 {
            self.symbol.read()
        }

        fn decimals(self: @ContractState) -> u8 {
            self.decimals.read()
        }

        fn total_supply(self: @ContractState) -> u256 {
            self.total_supply.read()
        }

        fn allowance(
            self: @ContractState, owner: ContractAddress, spender: ContractAddress
        ) -> u256 {
            self.allowances.entry(owner).entry(spender).read()
        }

        fn owner(self: @ContractState) -> ContractAddress {
            self.owner.read()
        }

        fn balance_of(self: @ContractState, account: ContractAddress) -> u256 {
            self.balances.entry(account).read()
        }

        fn mint(ref self: ContractState, account: ContractAddress, amount: u256) {
            self.only_owner();
            self.address_zero(account);

            self.balances.entry(account).write(self.balances.entry(account).read() + amount);

            self.total_supply.write(self.total_supply.read() + amount);

            self.emit(Mint { receiver: account, amount: amount });
        }

        fn transfer(ref self: ContractState, recipient: ContractAddress, amount: u256) {
            self.address_zero(recipient);

            assert(get_caller_address() != recipient, 'Cannot transfer to yourself');

            let sender = get_caller_address();
            let sender_balance = self.balances.entry(sender).read();

            assert(sender_balance >= amount, 'Insufficient balance');

            //remove_funds_from_the_sender
            self.balances.entry(sender).write(self.balances.entry(sender).read() - amount);

            //add it to the recipient account
            self.balances.entry(recipient).write(self.balances.entry(recipient).read() + amount);

            self.emit(Transfer { sender: sender, receiver: recipient, amount: amount });
        }

        fn transfer_from(
            ref self: ContractState,
            owner: ContractAddress,
            recipient: ContractAddress,
            amount: u256
        ) {
            self.address_zero(recipient);

            let caller = get_caller_address();
            let current_allowance = self.allowances.entry(owner).entry(caller).read();

            assert(current_allowance >= amount, 'Insufficient allowance');

            self.balances.entry(owner).write(self.balances.entry(owner).read() - amount);

            self.allowances.entry(owner).entry(caller).write(current_allowance - amount);

            self.balances.entry(recipient).write(self.balances.entry(recipient).read() + amount);

            self.emit(Transfer { sender: owner, receiver: recipient, amount: amount, });
        }

        fn approve(ref self: ContractState, spender: ContractAddress, amount: u256) {
            self.address_zero(spender);

            let owner = get_caller_address();

            self.allowances.entry(owner).entry(spender).write(amount);

            self.emit(Approval { owner: owner, spender: spender, value: amount });
        }

        fn increase_allowance(
            ref self: ContractState, spender: ContractAddress, added_amount: u256
        ) {
            self.address_zero(spender);

            let owner = get_caller_address();
            let current_allowance = self.allowances.entry(owner).entry(spender).read();

            let new_all = current_allowance + added_amount;

            self.allowances.entry(owner).entry(spender).write(new_all);

            self.emit(Approval { owner, spender, value: added_amount });
        }

        fn decrease_allowance(ref self: ContractState, spender: ContractAddress, sub_amount: u256) {
            self.address_zero(spender);

            let owner = get_caller_address();
            let current_allowance = self.allowances.entry(owner).entry(spender).read();

            assert(current_allowance >= sub_amount, 'Allowance cannot be below 0');

            let new_all = current_allowance - sub_amount;

            self.allowances.entry(owner).entry(spender).write(new_all);

            self.emit(Approval { owner, spender, value: sub_amount });
        }

        fn burn(ref self: ContractState, amount: u256) {
            let caller = get_caller_address();
            let burner_bal = self.balances.entry(caller).read();

            assert(burner_bal >= amount, 'Insufficient balance');

            self.total_supply.write(self.total_supply.read() - amount);
            self.balances.entry(caller).write(burner_bal - amount);

            self.emit(Burnt { burner: caller, value: amount });
        }

        fn init_ownership(ref self: ContractState, _pre_owner: ContractAddress) {
            self.only_owner();
            self.address_zero(_pre_owner);

            assert(
                self.init_owner.read() == contract_address_const::<0>(), 'Owner is yet to claim'
            );

            self.init_owner.write(_pre_owner);
        }

        fn claim_ownership(ref self: ContractState) {
            let caller = get_caller_address();
            let prev_owner = self.owner.read();

            assert(self.init_owner.read() == caller, 'Not the designated owner');

            self.init_owner.write(contract_address_const::<0>());
            self.owner.write(caller);

            self.emit(Ownership { current_owner: self.owner.read(), prev_owner: prev_owner })
        }
    }

    #[generate_trait]
    pub impl internalImpl of InternalTrait {
        fn address_zero(self: @ContractState, account: ContractAddress) {
            assert(account != contract_address_const::<0>(), 'zero address not allowed');
        }

        fn only_owner(ref self: ContractState) {
            assert(get_caller_address() == self.owner.read(), 'Only owner');
        }
    }
}
