using System;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Description;
using Microsoft.Bot.Connector;
using Newtonsoft.Json;
using LuisDemo.Dialogs;
using Microsoft.Bot.Builder.Dialogs;


namespace LuisDemo
{
    [BotAuthentication]
    public class MessagesController : ApiController
    {
        public async Task<HttpResponseMessage> Post([FromBody] Activity activity)
        {
            if (activity != null && activity.GetActivityType() == ActivityTypes.Message)
            {

                // Add Resumption Cookie Code Here

                var connector = new ConnectorClient(new Uri(activity.ServiceUrl));
                //Activity reply = activity.CreateReply($"I don't know how to automatically deal with your query - so I've passed it on to a 👨🏽 who will get back to you!");
                //await connector.Conversations.ReplyToActivityAsync(reply);

                var conversationReference = new ConversationReference(activity.Id,
                    activity.From, activity.Recipient, activity.Conversation, activity.ChannelId, activity.ServiceUrl);

                var data = JsonConvert.SerializeObject(conversationReference);

                // For demonstration - save the cookie to disk.  For a real application
                // save to your persistent store - e.g. blob storage, table storage, document db, etc
                File.WriteAllText(System.Web.Hosting.HostingEnvironment.MapPath("~/resume.json"), data);

                // Add Resumption Cookie Code Here


                await SendTypingActivity(activity);
                await Conversation.SendAsync(activity, () => new AcmeBankDialog());
            }

            var response = Request.CreateResponse(HttpStatusCode.OK);
            return response;
        }


        private static async Task SendTypingActivity(Activity activity)
        {
            var connector = new ConnectorClient(new Uri(activity.ServiceUrl));
            var isTypingReply = activity.CreateReply();
            isTypingReply.Type = ActivityTypes.Typing;
            await connector.Conversations.ReplyToActivityAsync(isTypingReply);


            Thread.Sleep(1000); // simulate bot think time
        }
    }
}
