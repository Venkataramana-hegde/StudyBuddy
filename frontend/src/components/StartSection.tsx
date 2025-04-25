const StartSection = ({ username }) => {
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
          <a
            href="/create-group"
            className="mt-4 inline-block px-6 py-3 bg-blue-500 text-white rounded-lg"
          >
            Create Now
          </a>
        </div>
        <div className="w-1/3 bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-medium">Join a Group</h3>
          <p className="mt-2">
            Join an existing study group and start collaborating.
          </p>
          <a
            href="/join-group"
            className="mt-4 inline-block px-6 py-3 bg-blue-500 text-white rounded-lg"
          >
            Join Now
          </a>
        </div>
      </div>
    </section>
  );
};

export default StartSection;
