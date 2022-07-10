import { PencilAltIcon } from '@heroicons/react/outline'
import React, { useState } from 'react'

import NewPost from '..'
import { Modal } from '../../../UI/Modal'

const NewPostModal: React.FC = () => {
  const [showModal, setShowModal] = useState<boolean>(false)

  return (
    <>
      <button
        type="button"
        className="flex items-start"
        onClick={() => {
          setShowModal(!showModal)
        }}
      >
        <PencilAltIcon className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
      <Modal
        title="New Post"
        icon={<PencilAltIcon className="w-5 h-5 text-brand" />}
        size="md"
        show={showModal}
        onClose={() => setShowModal(!showModal)}
      >
        <NewPost setShowModal={setShowModal} hideCard />
      </Modal>
    </>
  )
}

export default NewPostModal
