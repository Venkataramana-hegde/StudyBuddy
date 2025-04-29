"use client";

import { CreateGroupModal } from "@/components/group/CreateGroupModal";
import { JoinGroupModal } from "./group/JoinGroupModal";
import { useState } from "react";

const StartSection = ({ username }: { username: string }) => {
  const [openCreate, setOpenCreate] = useState(false);
    const [openJoin, setOpenJoin] = useState(false);

  return (
    <section id="startSection" className="py-20 text-center bg-light-gray">
      <h2 className="text-3xl font-semibold">Hello, {username}!</h2>
      <p className="text-lg mt-4">
        Ready to start studying? Let’s create or join a study group.
      </p>
      <div className="mt-8 flex justify-center gap-8">
        <div className="w-1/3 bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-medium">Create a Group</h3>
          <p className="mt-2">
            Start your own study group and invite others to join.
          </p>
          <button
            onClick={() => setOpenCreate(true)}
            className="mt-4 inline-block px-6 py-3 bg-blue-500 text-white rounded-lg"
          >
            Create Now
          </button>
        </div>

        <div className="w-1/3 bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-medium">Join a Group</h3>
          <p className="mt-2">
            Join an existing study group and start collaborating.
          </p>
          <button
            onClick={() => setOpenJoin(true)}
            className="mt-4 inline-block px-6 py-3 bg-blue-500 text-white rounded-lg"
          >
            Join Now
          </button>
        </div>
      </div>

      {/* Create Group Modal Mount Here */}
      <CreateGroupModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
      />

      <JoinGroupModal open={openJoin} onClose={() => setOpenJoin(false)} />
    </section>
  );
};

export default StartSection;
