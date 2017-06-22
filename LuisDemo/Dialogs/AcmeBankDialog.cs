using System;
using System.IO;
using System.Net;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Bot.Connector;
using Microsoft.Bot.Builder.Dialogs;
using Microsoft.Bot.Builder.Luis;
using Microsoft.Bot.Builder.Luis.Models;
using System.Net.Http;
using System.Web.Http;
using Newtonsoft.Json;


namespace LuisDemo.Dialogs
{
    // Specify the Model ID and Subscription Key for the Acme Bank LUIS Model
    [LuisModel("5083304d-4464-4d0d-b879-fd81bdf9fa05", "32ed7dd369e74995af7f62b6c891d266")]
    [Serializable]
    public class AcmeBankDialog : LuisDialog<object>
    {
        // Each intent in LUIS is mapped to a method on the Dialog using Attributes
        [LuisIntent("Pay Mortgage")]
        public async Task IntentSetTemperature(IDialogContext context, LuisResult result)
        {
            // LuisDialog passes in a LuisResult which contains
            // - The possible Intents and their confidence
            // - Entities recognised by LUIS categorised by type
            // - The original query (the users message)


            await context.PostAsync($"Thanks, I can help you pay off your mortgage.");
            context.Wait(MessageReceived);
        }

        [LuisIntent("Get Account Information")]
        public async Task IntentOpenGarageDoor(IDialogContext context, LuisResult result)
        {
            await context.PostAsync($"Here is your account information");
            context.Wait(MessageReceived);
        }



        [LuisIntent("")]
        public async Task IntentNone(IDialogContext context, LuisResult result)
        {
            //var activity = await result as Activity;

            //await context.PostAsync("Sorry, I don't know what you mean 😕");
            await context.PostAsync("I don't know how to automatically deal with your query - so I've passed it on to a 👨🏽 who will get back to you!");
            context.Wait(MessageReceived);
            
        }


    }
}
