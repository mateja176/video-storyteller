import { Box } from '@material-ui/core';
import { CommentCount, DiscussionEmbed } from 'disqus-react';
import { startCase } from 'lodash';
import React, { ComponentProps } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { env } from 'services';
import { useHref } from 'utils/hooks';

type DisqusConfig = ComponentProps<typeof CommentCount>['config'];

export interface DisqusProps extends RouteComponentProps {
  title?: DisqusConfig['title'];
  identifier?: DisqusConfig['identifier'];
}

const Disqus: React.FC<DisqusProps> = ({
  title,
  identifier,
  match: { url, path },
}) => {
  const href = useHref();

  const disqusConfig: DisqusConfig = {
    url: href,
    title: title || startCase(path),
    identifier: identifier || url,
  };

  return (
    <Box mt={40}>
      <CommentCount shortname={env.disqusShortname} config={disqusConfig} />
      <DiscussionEmbed shortname={env.disqusShortname} config={disqusConfig} />
    </Box>
  );
};
export default withRouter(Disqus);
