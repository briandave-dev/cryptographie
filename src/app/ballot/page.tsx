import { useState } from 'react';

const BallotPage = () => {
  const [vote, setVote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleVoteChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setVote(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Logic to submit the vote goes here
    // For example, call an API to save the vote
    setSubmitted(true);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Cast Your Vote</h1>
      {submitted ? (
        <p className="text-green-500">Your vote has been submitted!</p>
      ) : (
        <form onSubmit={handleSubmit} className="w-full max-w-md">
          <label htmlFor="vote" className="block mb-2">
            Select your choice:
          </label>
          <select
            id="vote"
            value={vote}
            onChange={handleVoteChange}
            className="border rounded p-2 mb-4 w-full"
            required
          >
            <option value="">--Please choose an option--</option>
            <option value="option1">Option 1</option>
            <option value="option2">Option 2</option>
            <option value="option3">Option 3</option>
          </select>
          <button type="submit" className="bg-blue-500 text-white rounded p-2">
            Submit Vote
          </button>
        </form>
      )}
    </div>
  );
};

export default BallotPage;