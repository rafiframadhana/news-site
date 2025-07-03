import React from 'react';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">About Atjèh Times</h1>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 text-lg mb-6">
              Welcome to <strong>Atjèh Times</strong>, a modern news platform committed to amplifying Aceh’s voice on the global stage.
            </p>
            <p className="text-gray-600 mb-4">
              Our mission is to empower local writers, journalists, and storytellers from Aceh by providing them with an international platform through English-language journalism.
            </p>
            <p className="text-gray-600 mb-4">
              We aim to bridge the gap between Aceh and the world by delivering accurate, compelling, and diverse stories that reflect the region's unique culture, issues, and achievements. Whether it’s politics, society, environment, arts, or human interest, we ensure each story is told with authenticity and global relevance.
            </p>
            <p className="text-gray-600 mb-4">
              Atjèh Times is more than just a news site — it’s a movement to bring Acehnese journalism to international standards, encouraging truth-seeking, ethical reporting, and global dialogue.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Our Mission</h2>
            <p className="text-gray-600 mb-4">
              To elevate Aceh’s stories and perspectives by nurturing local journalism talent and presenting their voices to the world in a professional and globally accessible format.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Our Values</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Empowerment of local journalists and storytellers</li>
              <li>Accuracy, fairness, and ethical reporting</li>
              <li>Global accessibility through English-language content</li>
              <li>Cultural respect and representation</li>
              <li>Commitment to transparency and public service</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
