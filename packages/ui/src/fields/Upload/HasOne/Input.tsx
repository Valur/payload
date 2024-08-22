'use client'

import type {
  ClientCollectionConfig,
  FieldDescriptionClientProps,
  FieldErrorClientProps,
  FieldLabelClientProps,
  FilterOptionsResult,
  MappedComponent,
  StaticDescription,
  StaticLabel,
  UploadField,
  UploadFieldClient,
} from 'payload'
import type { MarkOptional } from 'ts-essentials'

import { getTranslation } from '@payloadcms/translations'
import React, { useCallback, useEffect, useState } from 'react'

import type { DocumentDrawerProps } from '../../../elements/DocumentDrawer/types.js'
import type { ListDrawerProps } from '../../../elements/ListDrawer/types.js'

import { Button } from '../../../elements/Button/index.js'
import { useDocumentDrawer } from '../../../elements/DocumentDrawer/index.js'
import { FileDetails } from '../../../elements/FileDetails/index.js'
import { useListDrawer } from '../../../elements/ListDrawer/index.js'
import { useTranslation } from '../../../providers/Translation/index.js'
import { FieldDescription } from '../../FieldDescription/index.js'
import { FieldError } from '../../FieldError/index.js'
import { FieldLabel } from '../../FieldLabel/index.js'
import { fieldBaseClass } from '../../shared/index.js'
import { baseClass } from '../index.js'
import './index.scss'

export type UploadInputProps = {
  readonly Description?: MappedComponent
  readonly Error?: MappedComponent
  readonly Label?: MappedComponent
  /**
   * Controls the visibility of the "Create new collection" button
   */
  readonly allowNewUpload?: boolean
  readonly api?: string
  readonly className?: string
  readonly collection?: ClientCollectionConfig
  readonly customUploadActions?: React.ReactNode[]
  readonly description?: StaticDescription
  readonly descriptionProps?: FieldDescriptionClientProps<MarkOptional<UploadFieldClient, 'type'>>
  readonly errorProps?: FieldErrorClientProps<MarkOptional<UploadFieldClient, 'type'>>
  readonly field?: MarkOptional<UploadFieldClient, 'type'>
  readonly filterOptions?: FilterOptionsResult
  readonly label: StaticLabel
  readonly labelProps?: FieldLabelClientProps<MarkOptional<UploadFieldClient, 'type'>>
  readonly onChange?: (e) => void
  readonly readOnly?: boolean
  readonly relationTo?: UploadField['relationTo']
  readonly required?: boolean
  readonly serverURL?: string
  readonly showError?: boolean
  readonly style?: React.CSSProperties
  readonly value?: string
  readonly width?: string
}

export const UploadInputHasOne: React.FC<UploadInputProps> = (props) => {
  const {
    Description,
    Error,
    Label,
    allowNewUpload,
    api = '/api',
    className,
    collection,
    customUploadActions,
    descriptionProps,
    errorProps,
    field,
    filterOptions,
    label,
    labelProps,
    onChange,
    readOnly,
    relationTo,
    required,
    serverURL,
    showError,
    style,
    value,
    width,
  } = props

  const { i18n, t } = useTranslation()

  const [fileDoc, setFileDoc] = useState(undefined)
  const [missingFile, setMissingFile] = useState(false)
  const [collectionSlugs] = useState([collection?.slug])

  const [DocumentDrawer, DocumentDrawerToggler, { closeDrawer }] = useDocumentDrawer({
    collectionSlug: collectionSlugs[0],
  })

  const [ListDrawer, ListDrawerToggler, { closeDrawer: closeListDrawer }] = useListDrawer({
    collectionSlugs,
    filterOptions,
  })

  useEffect(() => {
    if (value !== null && typeof value !== 'undefined' && value !== '') {
      const fetchFile = async () => {
        const response = await fetch(`${serverURL}${api}/${relationTo}/${value}`, {
          credentials: 'include',
          headers: {
            'Accept-Language': i18n.language,
          },
        })
        if (response.ok) {
          const json = await response.json()
          setFileDoc(json)
        } else {
          setMissingFile(true)
          setFileDoc(undefined)
        }
      }

      void fetchFile()
    } else {
      setFileDoc(undefined)
    }
  }, [value, relationTo, api, serverURL, i18n])

  const onSave = useCallback<DocumentDrawerProps['onSave']>(
    (args) => {
      setMissingFile(false)
      onChange(args.doc)
      closeDrawer()
    },
    [onChange, closeDrawer],
  )

  const onSelect = useCallback<ListDrawerProps['onSelect']>(
    (args) => {
      setMissingFile(false)
      onChange({
        id: args.docID,
      })
      closeListDrawer()
    },
    [onChange, closeListDrawer],
  )

  if (collection.upload && typeof relationTo === 'string') {
    return (
      <div
        className={[
          fieldBaseClass,
          baseClass,
          className,
          showError && 'error',
          readOnly && 'read-only',
        ]
          .filter(Boolean)
          .join(' ')}
        style={{
          ...style,
          width,
        }}
      >
        <FieldLabel
          Label={Label}
          field={field}
          label={label}
          required={required}
          {...(labelProps || {})}
        />
        <div className={`${fieldBaseClass}__wrap`}>
          <FieldError CustomError={Error} field={field} {...(errorProps || {})} />
          {collection?.upload && (
            <React.Fragment>
              {fileDoc && !missingFile && (
                <FileDetails
                  collectionSlug={relationTo}
                  customUploadActions={customUploadActions}
                  doc={fileDoc}
                  handleRemove={
                    readOnly
                      ? undefined
                      : () => {
                          onChange(null)
                        }
                  }
                  uploadConfig={collection.upload}
                />
              )}
              {(!fileDoc || missingFile) && (
                <div className={`${baseClass}__wrap`}>
                  <div className={`${baseClass}__buttons`}>
                    {allowNewUpload && (
                      <DocumentDrawerToggler
                        className={`${baseClass}__toggler`}
                        disabled={readOnly}
                      >
                        <Button buttonStyle="secondary" disabled={readOnly} el="div">
                          {t('fields:uploadNewLabel', {
                            label: getTranslation(collection.labels.singular, i18n),
                          })}
                        </Button>
                      </DocumentDrawerToggler>
                    )}
                    <ListDrawerToggler className={`${baseClass}__toggler`} disabled={readOnly}>
                      <Button buttonStyle="secondary" disabled={readOnly} el="div">
                        {t('fields:chooseFromExisting')}
                      </Button>
                    </ListDrawerToggler>
                  </div>
                </div>
              )}
              <FieldDescription
                Description={Description}
                field={field}
                {...(descriptionProps || {})}
              />
            </React.Fragment>
          )}
          {!readOnly && <DocumentDrawer onSave={onSave} />}
          {!readOnly && <ListDrawer onSelect={onSelect} />}
        </div>
      </div>
    )
  }

  return null
}