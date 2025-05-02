import ChatModal from '@/components/group/ChatModal'
import { GroupNavbar } from '@/components/group/GroupNavbar'
import React from 'react'

const page = () => {
  return (
    <div>
      {/* <GroupNavbar /> */}
      <ChatModal />
      {/* <ChatModal groupId="abc123" userId="venky99" senderName="Venkataramana" /> */}
    </div>
  );
}

export default page