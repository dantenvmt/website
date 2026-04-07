import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AIWriteExperienceModal from './AIWriteExperienceModal';

const mockProblems = [
    { id: 'p1', title: 'Stakeholder Communication', description: 'Managing cross-functional teams' },
    { id: 'p2', title: 'Data Analysis', description: 'Turning data into decisions' },
];

const mockExperiences = [
    { id: 'e1', role: 'Manager', company: 'Acme', bullets: '• Led a team of 5\n• Improved KPIs by 20%' },
];

const mockAiAnalysis = {
    missingKeywords: [{ keyword: 'stakeholder management' }, { keyword: 'cross-functional' }],
    predictedKeywords: [{ keyword: 'agile' }],
};

const defaultProps = {
    jobDescription: 'We need someone to manage stakeholders.',
    experiences: mockExperiences,
    aiAnalysis: mockAiAnalysis,
    onInsert: jest.fn(),
    onGenerated: jest.fn(),
    onClose: jest.fn(),
};

beforeEach(() => {
    global.fetch = jest.fn(() =>
        Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ status: 'success', problems: mockProblems }),
        })
    );
});

afterEach(() => {
    jest.resetAllMocks();
});

test('renders analyzing spinner on mount', () => {
    render(<AIWriteExperienceModal {...defaultProps} />);
    expect(screen.getByText(/identifying key business problems/i)).toBeInTheDocument();
});
