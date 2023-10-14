use akiba_starknet::contract::SaverContract::{Saver,Save,Reward,ContractAddress};


#[starknet::interface]
trait ISaverContract<TContractState> {

    fn set_saver(ref self: TContractState, saver:Saver, key:ContractAddress);
    fn set_save(ref self: TContractState, save:Save, key: felt252);
    fn set_reward(ref self: TContractState, reward:Reward, key: felt252);

    fn get_saver(self: @TContractState, key:ContractAddress) ->  Saver;
    fn get_save(self: @TContractState, key:felt252) ->  Save;
    fn get_reward(self: @TContractState, key:felt252) ->  Reward;

}

#[starknet::contract]
mod SaverContract {
    use poseidon::poseidon_hash_span;
    use array::ArrayTrait;
    use starknet::ContractAddress;
    use core::debug::PrintTrait;
    use openzeppelin::token::erc721::{ERC721};
    use openzeppelin::token::erc721::interface::{IERC721};

     
    #[storage]
    struct Storage {
        owner:ContractAddress,
        savers: LegacyMap::<ContractAddress, Saver>,
        saves: LegacyMap::<felt252, Save>,
        rewards: LegacyMap::<felt252, Reward>,
  
    }

    #[derive(Copy, Drop, Serde, starknet::Store)]
    struct Saver {
        first_name: felt252,
        last_name: felt252,
        phone_number: felt252,
        email: felt252,
        address: ContractAddress,
        secret_word : felt252,
        total_saves_amount : u128,
        total_amount_earned : u128,
    }

    #[derive(Copy, Drop, Serde, starknet::Store)]
    struct Save {
        save_id: u64,
        saver_adress: ContractAddress,
        save_amount: u64,
        token_uri: felt252,
        save_earnings: u64,
        save_start:u64,
        save_end:u64,
        save_period:felt252,
        witdraw_penalty:u64,
    }



    #[derive(Copy, Drop, Serde, starknet::Store)]
    struct Reward {
        reward_id: felt252, 
        reward_uri: felt252, 
        redeemed:bool,
        rewarded_user:ContractAddress,
    }

    #[constructor]
    fn constructor(ref self: ContractState,owner:ContractAddress,name: felt252,symbol:felt252) {
        
        let mut unsafe_state = ERC721::unsafe_new_contract_state();
        ERC721::InternalImpl::initializer(ref unsafe_state,name,symbol);
        self.owner.write(owner);
        
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
        fn set_save(ref self: ContractState,value:Save,key: felt252,recepient:ContractAddress,  token_id: u256){
            self._set_save(value,key);
            let mut unsafe_state = ERC721::unsafe_new_contract_state();
            ERC721::InternalImpl::_mint(ref unsafe_state,recepient,token_id);

        }
        fn set_reward(ref self: ContractState,value:Reward,key: felt252){
            self._set_reward(value,key);
        }

        fn get_saver(self: @ContractState, key: ContractAddress) -> Saver {
            let saver = self.savers.read(key);
            saver
            
        }

        fn get_save(self: @ContractState, key: felt252) -> Save{
            let save = self.saves.read(key);
            save
        }

        fn get_reward(self: @ContractState, key: felt252) -> Reward{
            let reward = self.rewards.read(key);
            reward
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


    }


    #[generate_trait]
    impl SaverContractFunctionsImpl of SaverContractFunctionsTrait {
        // @dev Internal function to generate hashes
        fn _set_saver(ref self: ContractState,value:Saver,key: ContractAddress){
            self.savers.write(key,value);
        }

        fn _set_save(ref self: ContractState,value:Save, key: felt252){
            self.saves.write(key,value);
        }

        fn _set_reward(ref self: ContractState,value:Reward, key: felt252){
            self.rewards.write(key,value);
        }
   
    }

}




#[cfg(test)]
mod tests {
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


       
    fn deploy() -> ISaverContractDispatcher {
        // Set up constructor arguments.
        let mut calldata: Array<felt252> = ArrayTrait::new();
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
        
        let mut contract = deploy();


        let userContractAddress: ContractAddress =  contract_address_const::<0x00000>();


        let saver_instance = Saver {
            first_name: 'John',
            last_name: 'Doe',
            phone_number: '07784389382',
            email: 'john@example.com',
            address: userContractAddress,
            secret_word: 'XXXXXXXX',
            total_saves_amount: 0, // Set an appropriate initial value for these fields
            total_amount_earned: 0,
        };
        // hashed data key
        contract.set_saver(saver_instance,userContractAddress);


        // Read the array.
        let saver = contract.get_saver(userContractAddress);
        assert(saver.phone_number == '07784389382', 'read');


    }


    #[test]
    #[available_gas(20000000)]
    fn test_set_save(){

        let mut contract = deploy();

        let userContractAddress: ContractAddress =  contract_address_const::<0x00000>();

        let save_instance = Save {
            save_id: 123,  // Replace with the desired u64 value
            saver_adress: userContractAddress,
            save_amount: 500,  // Replace with the desired u64 value
            token_uri: 'your_token_uri_here',  // Replace with the desired felt252 value
            save_earnings: 100,  // Replace with the desired u64 value
            save_period: 'your_save_period_here',  // Replace with the desired felt252 value
            save_start:30000,
            save_end:6000,
            witdraw_penalty:2,
        };
                // hashed data key
        contract.set_save(save_instance,'123');

        // Read the array.
        let save = contract.get_save('123');
        assert(save.save_id == 123, 'read');

    }

        
    #[test]
    #[available_gas(20000000)]
    fn test_set_reward(){

        let mut contract = deploy();

        let userContractAddress: ContractAddress =  contract_address_const::<0x00000>();

        let reward_instance = Reward {
            reward_id: '123',  // Replace with the desired felt252 value
            reward_uri: 'your_reward_uri_here',  // Replace with the desired felt252 value
            redeemed: false,  // Set to true or false as needed
            rewarded_user: userContractAddress,
        };
        
                // hashed data key
        contract.set_reward(reward_instance,'123');

        // Read the array.
        let reward = contract.get_reward('123');
        assert(reward.reward_id == '123', 'read');

    }
}