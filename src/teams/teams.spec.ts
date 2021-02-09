import 'jasmine';

import { TeamStory } from './teams';

describe('teams', () => {
  it('creates story from message', async () => {
    // Create mock message
    const msg: any = {
      cleanContent: '@devops why did my build fail?',
      client: {
        users: {
          fetch: (() => Promise.resolve({ id: 'bar' })),
        },
      },
    };

    const story = await TeamStory.fromMessage(
      'This is a test',
      msg,
      'STORY',
      ['foo'],
    );

    expect(story.assignee.id).toEqual('bar');
    expect(story.description).toEqual('This is a test, why did my build fail?');
    expect(story.id).toMatch(/STORY-[1-9]\d\d\d/);
    expect(story.points).toMatch(/2|3|5|8|13/);
  });
});
