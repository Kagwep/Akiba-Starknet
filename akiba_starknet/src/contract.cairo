use akiba_starknet::contract::SaverContract::{Saver,Save,Reward,ContractAddress};


#[starknet::interface]
trait ISaverContract<TContractState> {

    fn set_saver(ref self: TContractState, saver:Saver, key:ContractAddress);
    fn set_save(ref self: TContractState, save:Save, key: u256,token_id: u256);
    fn set_reward(ref self: TContractState, reward:Reward, key: u256);
    fn get_saver(self: @TContractState, key:ContractAddress) ->  Saver;
    fn get_save(self: @TContractState, key:u256) ->  Save;
    fn get_reward(self: @TContractState, key:u256) ->  Reward;
    fn name(self: @TContractState) -> felt252;
    fn symbol(self: @TContractState) -> felt252;
    fn token_uri(self: @TContractState,token_id: u256) -> felt252;
    fn balance_of(self: @TContractState, account: ContractAddress) -> u256;
    fn owner_of(self: @TContractState, token_id: u256) -> ContractAddress;
    fn withdraw_save(ref self: TContractState,save_id:u256,end_date:u256);
    

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
        witdraw_penalty:u64,
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


        fn set_save(ref self: ContractState,mut value:Save,key: u256){

            let new_save_id = self.save_id_count.read() + 1;

            let value.save_id = new_save_id;

            self.save_id_count.write(new_save_id);

            let new_toke_id = self.token_id_count.read();

            self.token_id_count.read(new_token_i)

            let recepient = get_caller_address();
            let mut unsafe_state = ERC721::unsafe_new_contract_state();
            ERC721::InternalImpl::_mint(ref unsafe_state,value.saver_adress,token_id);

            let is_recepient_saver = self.is_saver.read(recepient);

            let user_is_saver =  self._is_user_saver(recepient);

            if user_is_saver {
                let mut saver = self.savers.read(recepient);
                let saver_address = saver.address;
                saver.total_saves_amount += value.save_amount;
                self._set_saver(saver,recepient);
            } else {

                let saver = Saver {
                    address: recepient, total_saves_amount: value.save_amount, total_amount_earned: 0
                    };
                self._set_saver(saver,recepient);
                self.is_saver.write(recepient,true);
            }

            self._set_save(value,key);
        }

        fn set_reward(ref self: ContractState,value:Reward,key: u256){
            self._set_reward(value,key);
      
        }

        fn withdraw_save(ref self: ContractState,save_id:u256,end_date:u256,reward_id:u256){
            let save_to_withdraw  = self.saves.read(save_id);
            let recepient = get_caller_address();
            let mut withdrawing_saver = self.savers.read(recepient);

            let save_owner = self.owner_of(save_to_withdraw.token_id);
            
            assert(recepient == save_owner,'Error: WRONG_REQUESTER');

            let save_end_date = save_to_withdraw.save_end;

            if save_end_date < end_date {
                // burn the token
                // petrform a transfer
                withdrawing_saver.total_saves_amount -= save_to_withdraw.save_amount;
                self._set_saver(withdrawing_saver,recepient);

                let reward_id = self.rewards_id_count.read() + 1;
                self.rewards_id_count.write(reward_id);
                let reward = Reward {
                    reward_id: reward_id, reward_uri: 'amnesty',token_id:1, redeemed: false,reward_type:'amnesty',rewarded_user:recepient
                    };
                self._set_reward(reward,reward_id);


            } else{

                let difference = end_date - save_end_date;
                let to_days: u256 = 1000 * 60 * 60 * 24;
                

                let penalty_value = difference/to_days;

                if penalty_value <= 2_u256 {
                    let penalty_amount = save_to_withdraw.save_amount * 1/100;
                    self._perform_withdraw(save_to_withdraw,penalty_amount,withdrawing_saver,recepient,reward_id);
                } else if penalty_value > 2_u256 &&  penalty_value <= 10_u256{
                    let penalty_amount = save_to_withdraw.save_amount * 2/100;
                    self._perform_withdraw(save_to_withdraw,penalty_amount,withdrawing_saver,recepient,reward_id);
                }else if penalty_value > 10_u256 &&  penalty_value <= 30_u256{
                    let penalty_amount = save_to_withdraw.save_amount * 3/100;
                    self._perform_withdraw(save_to_withdraw,penalty_amount,withdrawing_saver,recepient,reward_id);
                }else {
                    let penalty_amount = save_to_withdraw.save_amount * 5/100;
                    self._perform_withdraw(save_to_withdraw,penalty_amount,withdrawing_saver,recepient,reward_id);
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

        fn _set_save(ref self: ContractState,value:Save, key: u256){
            self.saves.write(key,value);
        }

            
        fn _is_user_saver(self: @ContractState,address: ContractAddress) -> bool {
            // Read the registration status of the address from storage
            self.is_saver.read(address)
        }


        fn _set_reward(ref self: ContractState,value:Reward, key: u256){
            self.rewards.write(key,value);
        }         
        
        fn _perform_withdraw(ref self: ContractState,save_to_withdraw:Save,mut penalty_amount:u256,mut withdrawing_saver:Saver,recepient:ContractAddress,reward_id:u256){
            
            if reward_id != 0_256{
                let reward = self.rewards.read(reward_id);
                let reward_owner = self.owner_of(reward.token_id);
                assert(reward_owner ==  recepient, 'ERROR: INCORRECT REWARD OWNER');
                if reward.reward_type == 'amnesty'{
                    penalty_amount  = 0;
                    // burn token
                } 
            }

            let savers_amount = save_to_withdraw.save_amount - penalty_amount;
            self.akibas_earnings.write(penalty_amount);

            withdrawing_saver.total_saves_amount -= save_to_withdraw.save_amount;
            self._set_saver(withdrawing_saver,recepient);
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

        // save_id: u256,
        // saver_adress: ContractAddress,
        // save_amount: u256,
        // token_id: u256,
        // save_earnings: u256,
        // save_start:u256,
        // save_end:u256,
        // save_period:felt252,
        // witdraw_penalty:u64,

        let save_instance = Save {
            save_id: 123,  // Replace with the desired u64 value
            saver_adress: userContractAddress,
            save_amount: 500,  // Replace with the desired u64 value
            token_id: 1,  // Replace with the desired felt252 value
            save_earnings: 100,  // Replace with the desired u64 value
            save_start:30000,
            save_end:6000,
            save_period: 'your_save_period_here',  // Replace with the desired felt252 value
            witdraw_penalty:2,
        };

        let token_id = 1_u256;
                // hashed data key
        contract.set_save(save_instance,123,token_id);

        // // Read the array.
        let save = contract.get_save(123);
        assert(save.save_id == 123, 'read');

    }

        
    #[test]
    #[available_gas(20000000)]
    fn test_set_reward(){

        let name:felt252 = 'Akiba';
        let symbol:felt252 = 'AKB'; 

        let mut contract = deploy(name,symbol);

        let userContractAddress: ContractAddress =  contract_address_const::<0x00000>();

        let reward_instance = Reward {
            reward_id: 123,  // Replace with the desired felt252 value
            reward_uri: 'your_reward_uri_here',  // Replace with the desired felt252 value
            token_id:1,
            reward_type:'amnesty',
            redeemed: false,  // Set to true or false as needed
            rewarded_user: userContractAddress,
        };
        
                // hashed data key
        contract.set_reward(reward_instance,123);

        // Read the array.
        let reward = contract.get_reward(123);
        assert(reward.reward_id == 123, 'read');

    }
}