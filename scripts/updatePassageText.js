const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

const isDryRun = process.argv.includes('--dry-run');

async function updatePassageText() {
  const passageId = 'macklemores_grandma';
  const newText = `In the music video for Macklemore's song "Glorious," the representation of his centenarian grandmother, Helen, challenges cultural perceptions of aging. The video presents turning 100 as a milestone that transcends typical notions of old age, positioning centenarianism as a distinct and exceptional life stage. This portrayal reinforces the idea that extraordinary old age differs significantly from what society perceives as "normal" old age, simultaneously celebrating and commodifying the centenarian experience.
Helen's behavior in the video defies common stereotypes of aging. Upon being surprised by Macklemore, she enthusiastically declares, "I wanna do it all," signaling a desire for new experiences rather than reflecting on past accomplishments. This challenges the notion that old age is a period of reflection or decline. Instead, Helen's actions, such as shopping for trendy sneakers, singing karaoke, and throwing eggs at houses, reflect a youthful energy typically associated with younger generations. These activities construct an image of aging that emphasizes possibility, suggesting that centenarianism is not bound by the limitations often imposed on old age.
However, this portrayal raises the question of whether Helen's actions are genuinely reflective of her desires or are staged for the entertainment of a younger audience. The notion of centenarianism as a new beginning is reinforced by the song's lyrics. Macklemore sings, "I feel glorious, glorious / Got a chance to start again," suggesting that turning 100 marks a fresh start. In this context, centenarianism is framed as an antidote to the invisibility and decline associated with earlier stages of old age. Helen's 100th birthday serves as a threshold that allows her to re-enter the world of the living, escaping what the text refers to as the "waiting room" of old age. This depiction implies that only by reaching 100 can one truly overcome the negative connotations of aging, setting a high bar for what is considered successful aging.
The video also engages with the concept of the American Dream. Lyrics like "Wanna piece of the pie, grab the keys of the ride" reflect a belief in personal agency and hard work as the keys to success. Applied to aging, this suggests that maintaining vitality in old age is a matter of individual effort. Those who manage to "grab the keys" can escape the decline narrative, while those who cannot are left to face the consequences. This perspective ties into a neoliberal mindset that places the responsibility for aging well on the individual, reinforcing the idea that successful aging is a personal achievement rather than a societal construct.
While Helen's portrayal celebrates centenarianism, it also reinforces processes of "othering." Macklemore's staging of his grandmother positions her as an exceptional figure, distinct from other older adults. This exceptionalism can be read as a form of positive othering, where Helen is admired precisely because she defies ageist stereotypes. However, this admiration also reinforces the superiority of midlife, as the video caters to a younger audience's desire to see aging as a continuation of youth. Helen becomes a spectacle, a centenarian who is celebrated for her ability to act young, rather than for her intrinsic value as an older person.
Through Helen's actions and Macklemore's lyrics, the video challenges stereotypes of aging while reinforcing the idea that extraordinary old age is attainable through personal effort. Yet, by positioning centenarians as exceptional others, the video maintains the cultural hierarchy that privileges youth and midlife.`;

  try {
    const existingPassage = await prisma.passage.findUnique({
      where: { id: passageId },
    });

    if (!existingPassage) {
      console.error(`No passage found with ID: ${passageId}`);
      return;
    }

    if (isDryRun) {
      console.log('\n--- Dry Run: Preview of passage update ---');
      console.log('Passage ID:', passageId);
      console.log('Current text:', existingPassage.text.substring(0, 100) + '...');
      console.log('New text (first 100 chars):', newText.substring(0, 100) + '...');
      console.log('----------------------------------------\n');
    } else {
      const updatedPassage = await prisma.passage.update({
        where: { id: passageId },
        data: { text: newText },
      });
      console.log('Successfully updated passage text:', updatedPassage.id);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updatePassageText(); 