use akiba_starknet::contract::SaverContract::{Saver,Save,Reward,ContractAddress};


#[starknet::interface]
trait ISaverContract<TContractState> {

    fn set_saver(ref self: TContractState, saver:Saver, key:ContractAddress);
    fn set_save(ref self: TContractState,save_amount: u256,save_earnings: u256,save_start:u256,save_end:u256,save_period:felt252,witdraw_penalty:u256);
    fn set_reward(ref self: TContractState,reward_uri:felt252,reward_type:felt252);
    fn get_saver(self: @TContractState, key:ContractAddress) ->  Saver;
    fn get_save(self: @TContractState, key:u256) ->  Save;
    fn get_reward(self: @TContractState, key:u256) ->  Reward;
    fn name(self: @TContractState) -> felt252;
    fn symbol(self: @TContractState) -> felt252;
    fn token_uri(self: @TContractState,token_id: u256) -> felt252;
    fn balance_of(self: @TContractState, account: ContractAddress) -> u256;
    fn owner_of(self: @TContractState, token_id: u256) -> ContractAddress;
    fn withdraw_save(ref self: TContractState,save_id:u256,end_date:u256);
    fn transfer_save(ref self: TContractState,save_id:u256,end_date:u256,recepient:ContractAddress);

}

#[starknet::contract]
mod SaverContract {

    use poseidon::poseidon_hash_span;
    use array::ArrayTrait;
    use starknet::ContractAddress;
    use starknet::get_caller_address;
    use starknet::contract_address_const;
    use core::debug::PrintTrait;
    use openzeppelin::token::erc721::{ERC721};
    use openzeppelin::token::erc721::interface::{IERC721};

     
    #[storage]
    struct Storage {
        owner:ContractAddress,
        savers: LegacyMap::<ContractAddress, Saver>,
        saves: LegacyMap::<u256, Save>,
        rewards: LegacyMap::<u256, Reward>,
        save_id_count:u256,
        rewards_id_count:u256,
        akibas_earnings:u256,
        is_saver: LegacyMap::<ContractAddress, bool>,
        token_id_count:u256,
        key_count:u256,
    }

    #[derive(Copy, Drop, Serde, starknet::Store)]
    struct Saver {

        address: ContractAddress,
        total_saves_amount : u256,
        total_amount_earned : u256,
    }

    #[derive(Copy, Drop, Serde, starknet::Store)]
    struct Save {
        save_id: u256,
        saver_adress: ContractAddress,
        save_amount: u256,
        token_id: u256,
        save_earnings: u256,
        save_start:u256,
        save_end:u256,
        save_period:felt252,
        witdraw_penalty:u256,
        save_active:bool,
    }



    #[derive(Copy, Drop, Serde, starknet::Store)]
    struct Reward {
        reward_id: u256, 
        reward_uri: felt252,
        token_id:u256,
        redeemed:bool,
        reward_type:felt252,
        rewarded_user:ContractAddress,
    }

    #[constructor]
    fn constructor(ref self: ContractState,name: felt252,symbol:felt252) {
        
        let mut unsafe_state = ERC721::unsafe_new_contract_state();
        ERC721::InternalImpl::initializer(ref unsafe_state,name,symbol);

        // Set contract deployer as the owner
        let contract_deployer:ContractAddress = get_caller_address();
        self.owner.write(contract_deployer);
        self.save_id_count.write(0);
        self.rewards_id_count.write(0);
        self.token_id_count.write(0);
        self.key_count.write(0);
        
    }


    #[external(v0)]
    #[generate_trait]
    impl SaverContract of ISaverContract {
        
        fn name(self: @ContractState) -> felt252 {
            let unsafe_state = ERC721::unsafe_new_contract_state();
            ERC721::ERC721MetadataImpl::name(@unsafe_state)
        }

        fn symbol(self: @ContractState) -> felt252 {
            let unsafe_state = ERC721::unsafe_new_contract_state();
            ERC721::ERC721MetadataImpl::symbol(@unsafe_state)
            }

        fn set_saver(ref self: ContractState,value:Saver,key:ContractAddress){
            self._set_saver(value,key);
        }

        fn token_uri(self: @ContractState,token_id: u256) -> felt252 {
            let unsafe_state = ERC721::unsafe_new_contract_state();
            ERC721::ERC721MetadataImpl::token_uri(@unsafe_state,token_id)
        
            }

        fn balance_of(self: @ContractState, account: ContractAddress) -> u256 {
                let unsafe_state = ERC721::unsafe_new_contract_state();
                ERC721::ERC721Impl::balance_of(@unsafe_state,account)
            }

        fn owner_of(self: @ContractState, token_id: u256) -> ContractAddress {
            let unsafe_state = ERC721::unsafe_new_contract_state();
            ERC721::ERC721Impl::owner_of(@unsafe_state,token_id)
            }


        fn set_save(
            ref self: ContractState,
            save_amount: u256,
            save_earnings: u256,
            save_start:u256,
            save_end:u256,
            save_period:felt252,
            witdraw_penalty:u256,
            ){

            let token_id = self.token_id_count.read() + 1;

            self.token_id_count.write(token_id);

            let recepient = get_caller_address();

            let userContractAddress: ContractAddress =  contract_address_const::<0x00001>();

            let mut unsafe_state = ERC721::unsafe_new_contract_state();
            ERC721::InternalImpl::_mint(ref unsafe_state,userContractAddress,token_id);

            let is_recepient_saver = self.is_saver.read(recepient);

            let user_is_saver =  self._is_user_saver(recepient);

            let save_id = self.save_id_count.read() + 1;

            self.save_id_count.write(save_id);


            if user_is_saver {
                let mut saver = self.savers.read(recepient);
                let saver_address = saver.address;
                saver.total_saves_amount += save_amount;
                self._set_saver(saver,recepient);
            } else {

                let saver = Saver {
                    address: recepient, total_saves_amount: save_amount, total_amount_earned: 0
                    };
                self._set_saver(saver,recepient);
                self.is_saver.write(recepient,true);
            }

            let key = self.key_count.read() + 1;
            self.key_count.write(key);

            self._set_save(
                key,
                save_id,
                recepient,
                save_amount,
                token_id,
                save_earnings,
                save_start,
                save_end,
                save_period,
                witdraw_penalty
                );
        }

        fn set_reward(
            ref self: ContractState,
            reward_uri: felt252,
            reward_type:felt252,
            ){

            let mut  recepient = get_caller_address();

            let userContractAddress: ContractAddress =  contract_address_const::<0x00001>();

             recepient = userContractAddress;

            self._set_reward(
            reward_uri,
            reward_type, 
            recepient,
                );
      
        }

        fn withdraw_save(ref self: ContractState,save_key:u256,end_date:u256){
            let mut save_to_withdraw  = self.saves.read(save_key);
            let mut recepient = get_caller_address();
            let mut withdrawing_saver = self.savers.read(recepient);

             let userContractAddress: ContractAddress =  contract_address_const::<0x00001>();

             recepient = userContractAddress;

            let save_owner = self.owner_of(save_to_withdraw.token_id);
            
            assert(recepient == save_owner,'Error: WRONG_REQUESTER');

            let save_end_date = save_to_withdraw.save_end;

            if save_end_date < end_date {
                // burn the token
                // petrform a transfer of funds
                withdrawing_saver.total_saves_amount -= save_to_withdraw.save_amount;
                self._set_saver(withdrawing_saver,recepient);

                save_to_withdraw.save_active = false;

                self.saves.write(save_key,save_to_withdraw);

                let mut unsafe_state = ERC721::unsafe_new_contract_state();
                ERC721::InternalImpl::_burn(ref unsafe_state,save_to_withdraw.token_id);


                let reward_uri:felt252 = 'amnesty';
                let reward_type:felt252 = 'amnesty';

                self._set_reward(
                    reward_uri,
                    reward_type, 
                    recepient,
                    );


            } else{

                let reward_id = self.rewards_id_count.read() + 1;
                self.rewards_id_count.write(reward_id);

                let difference = end_date - save_end_date;
                let to_days: u256 = 1000 * 60 * 60 * 24;
                

                let penalty_value = difference/to_days;

                if penalty_value <= 2_u256 {
                    let penalty_amount = save_to_withdraw.save_amount * 1/100;
                    self._perform_withdraw(save_key,save_to_withdraw,penalty_amount,withdrawing_saver,recepient,reward_id);
                } else if penalty_value > 2_u256 &&  penalty_value <= 10_u256{
                    let penalty_amount = save_to_withdraw.save_amount * 2/100;
                    self._perform_withdraw(save_key,save_to_withdraw,penalty_amount,withdrawing_saver,recepient,reward_id);
                }else if penalty_value > 10_u256 &&  penalty_value <= 30_u256{
                    let penalty_amount = save_to_withdraw.save_amount * 3/100;
                    self._perform_withdraw(save_key,save_to_withdraw,penalty_amount,withdrawing_saver,recepient,reward_id);
                }else {
                    let penalty_amount = save_to_withdraw.save_amount * 5/100;
                    self._perform_withdraw(save_key,save_to_withdraw,penalty_amount,withdrawing_saver,recepient,reward_id);
                }


                }
        }


        fn transfer_save(ref self:ContractState,save_key:u256,end_date:u256,recepient:ContractAddress){

            let save_to_transfer  = self.saves.read(save_key);
            let mut withdrawing_saver = self.savers.read(recepient);

            let from = get_caller_address();

            let save_owner = self.owner_of(save_to_transfer.token_id);
            
            assert(recepient == save_owner,'Error: WRONG_REQUESTER');

            let save_end_date = save_to_transfer.save_end;

            if save_end_date < end_date {
                // burn the token
                // petrform a transfer
                withdrawing_saver.total_saves_amount -= save_to_transfer.save_amount;
                self._set_saver(withdrawing_saver,recepient);

                let mut unsafe_state = ERC721::unsafe_new_contract_state();

                ERC721::ERC721Impl::transfer_from(ref unsafe_state,from,recepient,save_to_transfer.token_id);


                let reward_uri:felt252 = 'amnesty';
                let reward_type:felt252 = 'amnesty';

                self._set_reward(
                    reward_uri,
                    reward_type, 
                    recepient,
                    );

                let reward_uri_1:felt252 = 'amnesty';
                let reward_type_1:felt252 = 'Appreciation';

                self._set_reward(
                    reward_uri_1,
                    reward_type_1, 
                    recepient,
                    );

                
                let reward_uri_2:felt252 = 'amnesty';
                let reward_type_2:felt252 = 'Appreciation';

                self._set_reward(
                    reward_uri_2,
                    reward_type_2, 
                    from,
                    );

                let reward_uri_3:felt252 = 'amnesty';
                let reward_type_3:felt252 = 'amnesty';

                self._set_reward(
                    reward_uri_3,
                    reward_type_3, 
                    from,
                    );
                

                


            } else{

                let reward_id = self.rewards_id_count.read() + 1;
                self.rewards_id_count.write(reward_id);

                let difference = end_date - save_end_date;
                let to_days: u256 = 1000 * 60 * 60 * 24;
                

                let penalty_value = difference/to_days;

                if penalty_value <= 2_u256 {
                    let penalty_amount = save_to_transfer.save_amount * 1/300;
                    self._perform_withdraw(save_key,save_to_transfer,penalty_amount,withdrawing_saver,recepient,reward_id);
                } else if penalty_value > 2_u256 &&  penalty_value <= 10_u256{
                    let penalty_amount = save_to_transfer.save_amount * 1/200;
                    self._perform_withdraw(save_key,save_to_transfer,penalty_amount,withdrawing_saver,recepient,reward_id);
                }else if penalty_value > 10_u256 &&  penalty_value <= 30_u256{
                    let penalty_amount = save_to_transfer.save_amount * 1/100;
                    self._perform_withdraw(save_key,save_to_transfer,penalty_amount,withdrawing_saver,recepient,reward_id);
                }else {
                    let penalty_amount = save_to_transfer.save_amount * 2/100;
                    self._perform_withdraw(save_key,save_to_transfer,penalty_amount,withdrawing_saver,recepient,reward_id);
                }


                }

        }

        fn get_saver(self: @ContractState, key: ContractAddress) -> Saver {
            let saver = self.savers.read(key);
            saver
            
        }

        fn get_save(self: @ContractState, key: u256) -> Save{
            let save = self.saves.read(key);
            save
        }

        fn get_reward(self: @ContractState, key: u256) -> Reward{
            let reward = self.rewards.read(key);
            reward
        }



    }


    #[generate_trait]
    impl SaverContractFunctionsImpl of SaverContractFunctionsTrait {
        // @dev Internal function to generate hashes
        fn _set_saver(ref self: ContractState,value:Saver,key: ContractAddress){
            self.savers.write(key,value);
        }

        fn _set_save(
            ref self: ContractState,
            key: u256,
            save_id: u256,
            saver_adress: ContractAddress,
            save_amount: u256,
            token_id: u256,
            save_earnings: u256,
            save_start:u256,
            save_end:u256,
            save_period:felt252,
            witdraw_penalty:u256,
            ){
            let save = Save{
                save_id:save_id,
                saver_adress:saver_adress,
                save_amount:save_amount,
                token_id:token_id,
                save_earnings:save_earnings,
                save_start:save_start,
                save_end:save_end,
                save_period:save_period,
                witdraw_penalty:witdraw_penalty,
                save_active:true,
            };
            self.saves.write(key,save);
        }

            
        fn _is_user_saver(self: @ContractState,address: ContractAddress) -> bool {
            // Read the registration status of the address from storage
            self.is_saver.read(address)
        }


        fn _set_reward(
            ref self: ContractState,
            reward_uri: felt252,
            reward_type:felt252,
            recepient:ContractAddress,
            ){


            let token_id = self.token_id_count.read() + 1;
            self.token_id_count.write(token_id);

            let key = self.key_count.read() + 1;
            self.key_count.write(key);

            let reward_id = self.rewards_id_count.read() + 1;
            self.rewards_id_count.write(reward_id);

            let reward = Reward {
                reward_id: reward_id, reward_uri: reward_uri,token_id:token_id, redeemed: false,reward_type:reward_type,rewarded_user:recepient
            };

            self.rewards.write(key,reward);

            let mut unsafe_state = ERC721::unsafe_new_contract_state();
            ERC721::InternalImpl::_mint(ref unsafe_state,recepient,token_id);

        }         
        
        fn _perform_withdraw(ref self: ContractState,save_key:u256, save_to_withdraw:Save,mut penalty_amount:u256,mut withdrawing_saver:Saver,recepient:ContractAddress,reward_id:u256){
            
            if reward_id != 0_256{
                let reward = self.rewards.read(reward_id);
                let reward_owner = self.owner_of(reward.token_id);
                assert(reward_owner ==  recepient, 'ERROR: INCORRECT REWARD OWNER');
                if reward.reward_type == 'amnesty'{
                    penalty_amount  = 0;
                    // burn token
                    let mut unsafe_state = ERC721::unsafe_new_contract_state();
                    ERC721::InternalImpl::_burn(ref unsafe_state,reward.token_id);
                } 
            }

            let savers_amount = save_to_withdraw.save_amount - penalty_amount;
            self.akibas_earnings.write(penalty_amount);

            withdrawing_saver.total_saves_amount -= save_to_withdraw.save_amount;
            self._set_saver(withdrawing_saver,recepient);

            self.saves.write(save_key,save_to_withdraw);

            let mut unsafe_state = ERC721::unsafe_new_contract_state();
            ERC721::InternalImpl::_burn(ref unsafe_state,save_to_withdraw.token_id);

        }

        
   
    }

}




#[cfg(test)]
mod tests {
    use core::serde::Serde;
    use core::debug::PrintTrait;
    use akiba_starknet::contract::ISaverContractDispatcherTrait;
    use core::array::ArrayTrait;
    use super::SaverContract;
    use super::{ISaverContractDispatcher};
    use SaverContract::{Saver,Save,Reward};
    use starknet::deploy_syscall;
    use starknet::class_hash::Felt252TryIntoClassHash;
    use poseidon::poseidon_hash_span;
    use starknet::{ContractAddress,contract_address_const};
    use starknet::get_caller_address;


       
    fn deploy(name: felt252,symbol:felt252) -> ISaverContractDispatcher {
        // Set up constructor arguments.
        let mut calldata: Array<felt252> = ArrayTrait::new();

        name.serialize(ref calldata);
        symbol.serialize(ref calldata);

        let (address0, _) = deploy_syscall(SaverContract::TEST_CLASS_HASH.try_into().unwrap(), 0, calldata.span(), false).unwrap();

        // Return the dispatcher.
        // The dispatcher allows to interact with the contract based on its interface.
        ISaverContractDispatcher { contract_address: address0 }
    }



    #[test]
    #[available_gas(20000000)]
    fn test_set_saver() {
        // Set up.
        // let mut calldata: Array<felt252> = ArrayTrait::new();
        // let (address0, _) = deploy_syscall(SDIDContract::TEST_CLASS_HASH.try_into().unwrap(), 0, calldata.span(), false).unwrap();
        
        let name:felt252 = 'Akiba';
        let symbol:felt252 = 'AKB'; 

        let mut contract = deploy(name,symbol);

        let caller = get_caller_address();
        caller.print();

        let userContractAddress: ContractAddress =  contract_address_const::<0x00000>();


        let saver_instance = Saver {
            address: userContractAddress,
            total_saves_amount: 0, // Set an appropriate initial value for these fields
            total_amount_earned: 0,
        };

        

        // hashed data key
        contract.set_saver(saver_instance,userContractAddress);


        // Read the array.
        let saver = contract.get_saver(userContractAddress);
        assert(saver.total_saves_amount == 0, 'read');

        let akiba_symbol = contract.symbol();
        let akiba_name = contract.name();


        assert(akiba_symbol == 'AKB', 'Symbol of token');
        assert(akiba_name == 'Akiba','Name of token')


    }


    #[test]
    #[available_gas(20000000)]
    fn test_set_save(){

        let name:felt252 = 'Akiba';
        let symbol:felt252 = 'AKB'; 

        let mut contract = deploy(name,symbol);

        let userContractAddress: ContractAddress =  contract_address_const::<0x00001>();

        
        let    save_amount:u256 = 500;  // Replace with the desired u64 value
        let    save_earnings:u256 = 100;  // Replace with the desired u64 value
        let    save_start:u256 = 30000;
        let    save_end:u256 =  6000;
        let    save_period:felt252 = 'your_save_period_here';  // Replace with the desired felt252 value
        let   witdraw_penalty:u256 = 2;
        

        // hashed data key
        contract.set_save(save_amount: save_amount,save_earnings: save_earnings,save_start:save_start,save_end:save_end,save_period:save_period,witdraw_penalty:witdraw_penalty);

        // // Read the array.
        let save = contract.get_save(1);
        assert(save.save_amount == 500, 'read');

    }

        
    #[test]
    #[available_gas(20000000)]
    fn test_set_reward(){

        let name:felt252 = 'Akiba';
        let symbol:felt252 = 'AKB'; 

        let mut contract = deploy(name,symbol);

        let userContractAddress: ContractAddress =  contract_address_const::<0x00000>();

              // Replace with the desired felt252 value
        let reward_uri:felt252 =  'your_reward_uri_here';  // Replace with the desired felt252 value
        let reward_type:felt252 = 'amnesty';

        
                // hashed data key
        contract.set_reward(reward_uri,reward_type);

        // Read the array.
        let reward = contract.get_reward(1);
        assert(reward.reward_type == 'amnesty', 'read');

    }

    #[test]
    #[available_gas(20000000)]
    fn withdraw_save(){

        let name:felt252 = 'Akiba';
        let symbol:felt252 = 'AKB'; 

        let mut contract = deploy(name,symbol);


        let    save_amount:u256 = 500;  // Replace with the desired u64 value
        let    save_earnings:u256 = 100;  // Replace with the desired u64 value
        let    save_start:u256 = 30000;
        let    save_end:u256 =  6000;
        let    save_period:felt252 = 'your_save_period_here';  // Replace with the desired felt252 value
        let   witdraw_penalty:u256 = 2;
        

        // hashed data key
        contract.set_save(save_amount: save_amount,save_earnings: save_earnings,save_start:save_start,save_end:save_end,save_period:save_period,witdraw_penalty:witdraw_penalty);


        let save = contract.get_save(1);
        assert(save.save_amount == 500, 'read');

        let userContractAddress: ContractAddress =  contract_address_const::<0x00001>();

        let balance = contract.balance_of(userContractAddress);

        assert(balance == 1, 'BALANCE'); 
        
        let save_key:u256 = 1;
        let end_date:u256 = 6001;
        contract.withdraw_save(save_key,end_date);


    }
}