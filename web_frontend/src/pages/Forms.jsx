import React,{useEffect,useState,useContext} from 'react'

import CTA from '../components/CTA'
import PageTitle from '../components/Typography/PageTitle'
import SectionTitle from '../components/Typography/SectionTitle'
import { Input, HelperText, Label, Select, Textarea } from '@windmill/react-ui'

import { MailIcon } from '../icons'

import DatePicker from 'react-datepicker';

import 'react-datepicker/dist/react-datepicker.css'; // Import the CSS

import { Contract, Provider,constants, provider } from 'starknet'

import { AkibaContext } from '../context/AkibaContext'

import akiba from '../abi/akiba.json'
const contractAddress = "0x0023ff8e48fd701cb160cfd09e83d9d4cfa8895791b116cb52e59ef3af519884"



function Forms() {

  const {address,connection,account} = useContext(AkibaContext)

    const [formData, setFormData] = useState({
      save_amount: 0,
      save_end: new Date(), // Initialize with the current date
    });


    const handleSubmit = async (e) => {
      e.preventDefault();

      const { save_amount, save_end } = formData;

      // Convert save_end to milliseconds
      const saveEndMillis = Date.parse(save_end);

      // Calculate save_start as the current date in milliseconds
      const save_start = Date.now();

      // Calculate save_period as the difference between save_end and save_start
      const save_period = saveEndMillis - save_start;

      // Set save_earnings to 0
      const save_earnings = 0;

      console.log(account)

      console.log(saveEndMillis);

      // Now you can send this data to your smart contract using the appropriate method
      // Assuming you have a function to send data to your smart contract
      // sendToSmartContract(save_amount, save_earnings, save_start, saveEndMillis, save_period);

      const save_amount_int = parseInt(formData.save_amount, 10); // Convert to integer

      try{
        const contract = new Contract(akiba.abi,contractAddress,account);
        await contract.set_save(save_amount_int, save_earnings, save_start, saveEndMillis, save_period);
        console.log('done');
      }catch(error){
        console.log(error)
      }

      // Reset the form or take any other desired action
      setFormData({
        save_amount: 0,
        save_end: '',
      });
    };

    const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleDateChange = (date) => {
      const nextDay = new Date();
      nextDay.setDate(nextDay.getDate() + 1);
  
      if (date >= nextDay) {
        setFormData({ ...formData, save_end: date });
      }
    };




  return (
    <>
      <PageTitle>Add Save</PageTitle>
      <CTA />
      {/* <div class="p-8 rounded border border-gray-200">
            <p class="text-slate-400 mt-6">
              Start securing your financial future with our decentralized savings platform.
            </p>
            <form>
                <div class="mt-8 grid lg:grid-cols-2 gap-4">
                  <div>
                    <label for="save_amount" class="text-sm text-slate-200 block mb-1 font-medium">Save Amount</label>
                      <input type="number" name="save_amount" id="save_amount" class="bg-gray-100 border border-gray-200 rounded py-1 px-3 block focus:ring-blue-500 focus:border-blue-500 text-gray-700 w-full" placeholder="amount" />
                  </div>
                  <div>
                    <label for="save_end" class="text-sm text-slate-200 block mb-1 font-medium">Save End</label>
                      
                      <input type="text" name="save_end" id="save_end" class="bg-gray-100 border border-gray-200 rounded py-1 px-3 block focus:ring-blue-500 focus:border-blue-500 text-gray-700 w-full" placeholder="(01/01/1993)" />
                  </div>    
                </div>     
                <div class="space-x-4 mt-8">
                        <button type="submit" class="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 active:bg-blue-700 disabled:opacity-50">Save</button>
                        <button class="py-2 px-4 bg-white border border-gray-200 text-gray-600 rounded hover:bg-gray-100 active:bg-gray-200 disabled:opacity-50">Cancel</button>
                </div>   
            </form> 
      </div> */}
      <div className="p-8 rounded border border-gray-200">
      <p className="text-slate-400 mt-6">
        Start securing your financial future with our decentralized savings platform.
      </p>
      <form onSubmit={handleSubmit}>
        <div className="mt-8 grid lg:grid-cols-2 gap-4">
          <div>
            <label htmlFor="save_amount" className="text-sm text-slate-200 block mb-1 font-medium">
              Save Amount
            </label>
            <input
              type="number"
              name="save_amount"
              id="save_amount"
              value={formData.save_amount}
              onChange={handleChange}
              className="bg-gray-100 border border-gray-200 rounded py-1 px-3 block focus:ring-blue-500 focus:border-blue-500 text-gray-700 w-full"
              placeholder="amount"
            />
          </div>
          {/* <div>
            <label htmlFor="save_end" className="text-sm text-slate-200 block mb-1 font-medium">
              Save End
            </label>
            <input
              type="text"
              name="save_end"
              id="save_end"
              value={formData.save_end}
              onChange={handleChange}
              className="bg-gray-100 border border-gray-200 rounded py-1 px-3 block focus:ring-blue-500 focus:border-blue-500 text-gray-700 w-full"
              placeholder="(01/01/1993)"
            />
          </div> */}

          <div>
              <label htmlFor="save_end" className="text-sm text-slate-200 block mb-1 font-medium">
                Save End
              </label>
              <DatePicker
                selected={formData.save_end}
                onChange={handleDateChange}
                minDate={new Date()} // Restrict to today and future dates
                className="bg-gray-100 border border-gray-200 rounded py-1 px-3 block focus:ring-blue-500 focus:border-blue-500 text-gray-700 w-full"
              />
            </div>
        </div>
        <div className="space-x-4 mt-8">
          <button
            type="submit"
            className="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 active:bg-blue-700 disabled:opacity-50"
          >
            Save
          </button>
          <button
            className="py-2 px-4 bg-white border border-gray-200 text-gray-600 rounded hover:bg-gray-100 active:bg-gray-200 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
      
    </div>
    </>
  )
}

export default Forms
