import { expect } from 'chai';
import { Message } from 'discord.js';
import 'mocha';

import { TeamStory } from './teams.js';

describe('teams', () => {
  it('creates story from message', async () => {
    // Create mock message
    const msg = {
      cleanContent: '@devops why did my build fail?',
      client: {
        users: {
          fetch: (() => Promise.resolve({ id: 'bar' })),
        },
      },
    } as unknown as Message;

    const story = await TeamStory.fromMessage(
      'This is a test',
      msg,
      'STORY',
      ['foo'],
    );

    expect(story?.assignee.id).to.equal('bar');
    expect(story?.description).to.equal('This is a test, why did my build fail?');
    expect(story?.id).to.match(/STORY-[1-9]\d\d\d/);
    expect(story?.points).to.match(/2|3|5|8|13/);
  });
});
