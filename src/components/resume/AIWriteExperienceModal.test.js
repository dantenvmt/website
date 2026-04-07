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

test('Generate button is disabled until all problems are resolved', async () => {
    render(<AIWriteExperienceModal {...defaultProps} />);
    await waitFor(() => screen.getByText(/here's what this role actually needs to solve/i));

    // Button should be disabled with nothing filled
    expect(screen.getByRole('button', { name: /generate bullets/i })).toBeDisabled();
});

test('Generate button enables when all problems resolved with at least one to generate', async () => {
    render(<AIWriteExperienceModal {...defaultProps} />);
    await waitFor(() => screen.getByText(/here's what this role actually needs to solve/i));

    const selects = screen.getAllByRole('combobox');

    // Problem 1: No (will generate) — fill story + metrics
    fireEvent.change(selects[0], { target: { value: 'no' } });
    fireEvent.change(screen.getByPlaceholderText(/briefly describe/i), { target: { value: 'I handled stakeholders daily' } });
    fireEvent.change(screen.getByPlaceholderText(/e\.g\. reduced churn/i), { target: { value: '30% improvement' } });

    // Problem 2: Yes + no rewrite (auto-satisfied)
    fireEvent.change(selects[1], { target: { value: 'yes' } });
    const rewriteSelects = screen.getAllByRole('combobox');
    fireEvent.change(rewriteSelects[rewriteSelects.length - 1], { target: { value: 'no' } });

    expect(screen.getByRole('button', { name: /generate bullets/i })).not.toBeDisabled();
});

test('clicking a keyword chip appends it to the story textarea', async () => {
    render(<AIWriteExperienceModal {...defaultProps} />);
    await waitFor(() => screen.getByText(/here's what this role actually needs to solve/i));

    // Select "No" for first problem to reveal story field and chips
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: 'no' } });

    // Click the "stakeholder management" chip
    const chip = screen.getAllByText(/\+ stakeholder management/i)[0];
    fireEvent.click(chip);

    const storyTextarea = screen.getByPlaceholderText(/briefly describe/i);
    expect(storyTextarea.value).toBe('stakeholder management');
});

test('shows keyword coverage after bullets are generated', async () => {
    global.fetch
        .mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ status: 'success', problems: mockProblems }),
        })
        .mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({
                status: 'success',
                bullets: [
                    { problem_title: 'Stakeholder Communication', bullet: 'Led stakeholder management across 3 regions' },
                ],
            }),
        });

    render(<AIWriteExperienceModal {...defaultProps} />);
    await waitFor(() => screen.getByText(/here's what this role actually needs to solve/i));

    // Fill out problem 1 as "No"
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: 'no' } });
    fireEvent.change(screen.getByPlaceholderText(/briefly describe/i), { target: { value: 'I managed stakeholders' } });
    fireEvent.change(screen.getByPlaceholderText(/e\.g\. reduced churn/i), { target: { value: '30%' } });

    // Problem 2 as "Yes + no rewrite"
    fireEvent.change(selects[1], { target: { value: 'yes' } });
    await waitFor(() => screen.getByText(/want ai to rewrite/i));
    const rewriteSelects = screen.getAllByRole('combobox');
    fireEvent.change(rewriteSelects[rewriteSelects.length - 1], { target: { value: 'no' } });

    fireEvent.click(screen.getByRole('button', { name: /generate bullets/i }));

    await waitFor(() => screen.getByText(/keyword coverage/i));

    // "stakeholder management" appears in the bullet so it should be covered
    expect(screen.getByText(/✓ stakeholder management/i)).toBeInTheDocument();
    // "agile" (predicted) does not appear → still missing
    expect(screen.getByText(/✗ agile/i)).toBeInTheDocument();
});
