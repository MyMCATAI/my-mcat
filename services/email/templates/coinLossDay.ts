import { TemplateConfig } from '../types';

export interface CoinLossDayEmailData {
  userName: string;
  remainingCoins: number;
  scheduleUrl?: string;
  settingsUrl?: string;
}

export const coinLossDayTemplate = (data: CoinLossDayEmailData): TemplateConfig => ({
  subject: `Oops! A Mysterious Coin Incident 🙀`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 37.5rem; margin: 0 auto; padding: 1.25rem;">
      <p style="color: #333333; line-height: 1.6;">
        Hi ${data.userName}! 🐱
      </p>
      
      <p style="color: #333333; line-height: 1.6;">
        *ahem* The strangest thing happened... One of your coins went missing while you were away these past couple of days. 
        Totally not related, but did you know that coins make the most fascinating spinning sounds on hardwood floors? 
        And that drain covers have surprisingly large gaps? 🙈
      </p>

      <p style="color: #333333; line-height: 1.6;">
        Ok fine, it was me! I was playing with your shiny coin (they're just so sparkly!), and well... 
        it may have done a spectacular roll right into the drain. You now have ${data.remainingCoins} coins remaining. 
        I promise to be more careful with the others!
      </p>

      <p style="color: #333333; line-height: 1.6;">
        While I figure out how to fish it out (pun intended 😺), why don't you:
        <br>• Come back to your studies
        <br>• Keep your other coins safe from my... I mean, from mysterious disappearances
        <br>• Make some progress on your MCAT prep
      </p>

      <p style="color: #333333; line-height: 1.6;">
        Ready to return and keep an eye on your remaining coins?
        <br><br>
        • <a href="${data.scheduleUrl || 'https://mymcat.ai/home'}" style="color: #2b6cb0; text-decoration: underline;">Back to your study schedule</a>
      </p>

      <p style="color: #333333; line-height: 1.6;">
        Your slightly guilty study companion,<br>
        Kalypso 🐱<br>
        (Maybe we should invest in drain covers...)
      </p>

      <p style="color: #666666; font-size: 0.75rem; margin-top: 1.875rem;">
        Need to adjust your notification settings? <a href="${data.settingsUrl || 'https://mymcat.ai/preferences'}" style="color: #2b6cb0; text-decoration: underline;">Click here</a>
      </p>
    </div>
  `
}); 