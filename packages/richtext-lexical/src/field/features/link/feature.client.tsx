'use client'

import lexicalUtilsImport from '@lexical/utils'
const { $findMatchingParent } = lexicalUtilsImport

import lexicalImport from 'lexical'
const { $getSelection, $isRangeSelection } = lexicalImport

import type { FeatureProviderProviderClient } from '../types.js'
import type { ExclusiveLinkCollectionsProps } from './feature.server.js'
import type { LinkFields } from './nodes/types.js'

import { LinkIcon } from '../../lexical/ui/icons/Link/index.js'
import { getSelectedNode } from '../../lexical/utils/getSelectedNode.js'
import { FeaturesSectionWithEntries } from '../common/floatingSelectToolbarFeaturesButtonsSection/index.js'
import { createClientComponent } from '../createClientComponent.js'
import { AutoLinkNode } from './nodes/AutoLinkNode.js'
import { $isLinkNode, LinkNode, TOGGLE_LINK_COMMAND } from './nodes/LinkNode.js'
import { AutoLinkPlugin } from './plugins/autoLink/index.js'
import { ClickableLinkPlugin } from './plugins/clickableLink/index.js'
import { TOGGLE_LINK_WITH_MODAL_COMMAND } from './plugins/floatingLinkEditor/LinkEditor/commands.js'
import { FloatingLinkEditorPlugin } from './plugins/floatingLinkEditor/index.js'
import { LinkPlugin } from './plugins/link/index.js'

export type ClientProps = ExclusiveLinkCollectionsProps

const LinkFeatureClient: FeatureProviderProviderClient<ClientProps> = (props) => {
  return {
    clientFeatureProps: props,
    feature: () => ({
      clientFeatureProps: props,
      floatingSelectToolbar: {
        sections: [
          FeaturesSectionWithEntries([
            {
              ChildComponent: LinkIcon,
              isActive: ({ selection }) => {
                if ($isRangeSelection(selection)) {
                  const selectedNode = getSelectedNode(selection)
                  const linkParent = $findMatchingParent(selectedNode, $isLinkNode)
                  return linkParent != null
                }
                return false
              },
              key: 'link',
              label: `Link`,
              onClick: ({ editor, isActive }) => {
                if (!isActive) {
                  let selectedText = null
                  editor.getEditorState().read(() => {
                    selectedText = $getSelection().getTextContent()
                  })
                  const linkFields: LinkFields = {
                    doc: null,
                    linkType: 'custom',
                    newTab: false,
                    url: 'https://',
                  }
                  editor.dispatchCommand(TOGGLE_LINK_WITH_MODAL_COMMAND, {
                    fields: linkFields,
                    text: selectedText,
                  })
                } else {
                  // remove link
                  editor.dispatchCommand(TOGGLE_LINK_COMMAND, null)
                }
              },
              order: 1,
            },
          ]),
        ],
      },
      nodes: [LinkNode, AutoLinkNode],
      plugins: [
        {
          Component: LinkPlugin,
          position: 'normal',
        },
        {
          Component: AutoLinkPlugin,
          position: 'normal',
        },
        {
          Component: ClickableLinkPlugin,
          position: 'normal',
        },
        {
          Component: FloatingLinkEditorPlugin,
          position: 'floatingAnchorElem',
        },
      ],
    }),
  }
}

export const LinkFeatureClientComponent = createClientComponent(LinkFeatureClient)
