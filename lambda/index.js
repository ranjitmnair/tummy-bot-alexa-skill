/* *
 * This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
 * Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
 * session persistence, api calls, and more.
 * */
const Alexa = require('ask-sdk-core');
const request=require('request');
const axios = require('axios').default;
const https=require('https');
require('dotenv').config();
var query,city;

var postheaders = {
  'Content-Type': 'application/json; charset=utf-8',
  'user-key': process.env.SECRET_TOKEN,
  useQueryString:true
};




const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'Welcome buddy, Find out the best restaurants of your place from me';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

/*const HelloWorldIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'HelloWorldIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Hello World!';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};*/


const func=async()=>{
  let speakOutput = '';
  var optionspost = {
            //url: `https://developers.zomato.com/api/v2.1/search?entity_type=city&q=${query}&count=1&sort=rating&order=desc`,
            headers: postheaders,
            method: 'GET',
           // data: '{"entity_id":"11","entity_type":"city","count":"5"}',
          };

  try {
    const response = await axios.get(
        `https://developers.zomato.com/api/v2.1/search?entity_id=11&entity_type=city&q=${query}&count=1&sort=rating&order=desc`,
        optionspost
        );
        speakOutput+="The ratings of "+query+" are ";
        speakOutput+=response.data.restaurants[0].restaurant.user_rating.aggregate_rating;
  } catch (err) {
    speakOutput = err.toString();
  }
  return speakOutput;
}

const RestaurantRatingIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'RestaurantRatingIntent';
    },
    async handle(handlerInput) {
        query=Alexa.getSlotValue(handlerInput.requestEnvelope,'restaurant');
        try {
          let speakOutput = await func();
          return (
            handlerInput.responseBuilder
              .speak(speakOutput.toString() || 'some error occured')
              //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
              .getResponse()
          );
        } catch (err) {
          console.error('some error occured');
        }
        
    }
};




const funcr=async()=>{
  let speakOutput = '',cityidflag;
  var optionspost = {

            headers: postheaders,
            method: 'GET',
           // data: '{"entity_id":"11","entity_type":"city","count":"5"}',
          };

  try {
    const response = await axios.get(
        `https://developers.zomato.com/api/v2.1/locations?query=${city}`,
        optionspost
        );
        //speakOutput+="The ratings of "+query+" are ";
        cityidflag=response.data.location_suggestions[0].city_id;
        try{
            
            const responsein=await axios.get(
                `https://developers.zomato.com/api/v2.1/search?entity_id=${cityidflag}&entity_type=city&count=5&sort=rating&order=desc`,
                optionspost
            );
            for(let i=0;i<5;i++){
                speakOutput+=responsein.data.restaurants[i].restaurant.name+",";
            }
            
        }catch(err){console.log(err)}
  } catch (err) {
    speakOutput = err.toString();
  }
  speakOutput+=" are some of the best places to eat in "+city+'.';
  return speakOutput;
}









const TopRestaurantsIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'TopRestaurantsIntent';
    },
    async handle(handlerInput) {
        city=Alexa.getSlotValue(handlerInput.requestEnvelope,'place');
        try {
          let speakOutput = await funcr();
          return (
            handlerInput.responseBuilder
              .speak(speakOutput.toString() || 'some error occured')
              //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
              .getResponse()
          );
        } catch (err) {
          console.error('some error occured');
        }
        
    }
};









const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'You can say hello to me! How can I help?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet 
 * */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Sorry, I don\'t know about that. Please try again.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open 
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not 
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs 
 * */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    }
};
/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents 
 * by defining them above, then also adding them to the request handler chain below 
 * */
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below 
 * */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = 'Sorry, I had trouble doing what you asked. Please try again.';
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom 
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        HelpIntentHandler,
        RestaurantRatingIntentHandler,
        TopRestaurantsIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addErrorHandlers(
        ErrorHandler)
    .withCustomUserAgent('sample/hello-world/v1.2')
    .lambda();