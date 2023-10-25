import React from 'react'

import CTA from '../components/CTA'
import PageTitle from '../components/Typography/PageTitle'
import SectionTitle from '../components/Typography/SectionTitle'
import { Input, HelperText, Label, Select, Textarea } from '@windmill/react-ui'

import { MailIcon } from '../icons'

function Forms() {
  return (
    <>
      <PageTitle>Add Save</PageTitle>
      <CTA />
      <div class="p-8 rounded border border-gray-200">
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
      </div>
    </>
  )
}

export default Forms
