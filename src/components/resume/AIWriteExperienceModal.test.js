import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AIWriteExperienceModal from './AIWriteExperienceModal';

// Problem 1: has relevant experience. Problem 2: no experience (skip). Problem 3: has relevant experience.
const mockProblems = [
    { id: 1, title: 'Stakeholder Communication', description: 'Managing cross-functional teams', ai_has_experience: true },
    { id: 2, title: 'Data Analysis', description: 'Turning data into decisions', ai_has_experience: false },
    { id: 3, title: 'Budget Planning', description: 'Managing departmental budgets', ai_has_experience: true },
];

const mockExperiences = [
    { id: 'e1', role: 'Manager', company: 'Acme', bullets: 'Led a team of 5. Improved KPIs by 20%' },
];

const mockAiAnalysis = {
    missingKeywords: [{ keyword: 'stakeholder management' }, { keyword: 'cross-functional' }],
    predictedKeywords: [{ keyword: 'agile' }],
};

// onGenerated removed — no more usage limit
const defaultProps = {
    jobDescription: 'We need someone to manage stakeholders.',
    experiences: mockExperiences,
    aiAnalysis: mockAiAnalysis,
    onInsert: jest.fn(),
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

test('analyze call includes existing_bullets in body', async () => {
    render(<AIWriteExperienceModal {...defaultProps} />);
    await waitFor(() => screen.getByText(/here's what this role actually needs to solve/i));
    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body.existing_bullets).toBe('Led a team of 5. Improved KPIs by 20%');
});

test('problem with ai_has_experience false shows skip label', async () => {
    render(<AIWriteExperienceModal {...defaultProps} />);
    await waitFor(() => screen.getByText(/here's what this role actually needs to solve/i));
    expect(screen.getByText(/no relevant experience detected/i)).toBeInTheDocument();
});

test('problem with ai_has_experience true shows confirmation dropdown', async () => {
    render(<AIWriteExperienceModal {...defaultProps} />);
    await waitFor(() => screen.getByText(/here's what this role actually needs to solve/i));
    // Two problems have ai_has_experience=true, so two confirmation dropdowns
    const dropdowns = screen.getAllByRole('combobox');
    expect(dropdowns).toHaveLength(2);
    expect(dropdowns[0]).toHaveDisplayValue('Do you have experience solving this?');
});

test('confirming No shows metrics field and add-another button (no story for default entry)', async () => {
    render(<AIWriteExperienceModal {...defaultProps} />);
    await waitFor(() => screen.getByText(/here's what this role actually needs to solve/i));
    const dropdowns = screen.getAllByRole('combobox');
    fireEvent.change(dropdowns[0], { target: { value: 'no' } });
    expect(screen.getByPlaceholderText(/reduced churn by 30%/i)).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/briefly describe the situation/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add another experience/i })).toBeInTheDocument();
});

test('confirming Yes shows rewrite dropdown', async () => {
    render(<AIWriteExperienceModal {...defaultProps} />);
    await waitFor(() => screen.getByText(/here's what this role actually needs to solve/i));
    const dropdowns = screen.getAllByRole('combobox');
    fireEvent.change(dropdowns[0], { target: { value: 'yes' } });
    await waitFor(() => screen.getByText(/want ai to rewrite/i));
    expect(screen.getByText(/want ai to rewrite/i)).toBeInTheDocument();
});

test('rewrite Yes shows metrics field and keyword chips (no story for default entry)', async () => {
    render(<AIWriteExperienceModal {...defaultProps} />);
    await waitFor(() => screen.getByText(/here's what this role actually needs to solve/i));
    const dropdowns = screen.getAllByRole('combobox');
    fireEvent.change(dropdowns[0], { target: { value: 'yes' } });
    await waitFor(() => expect(screen.getAllByRole('combobox').length).toBe(3));
    // Rewrite dropdown for problem 1 is at index 1 (problem 3 confirmation is at index 2)
    const allDropdowns = screen.getAllByRole('combobox');
    fireEvent.change(allDropdowns[1], { target: { value: 'yes' } });
    await waitFor(() => screen.getByPlaceholderText(/reduced churn by 30%/i));
    expect(screen.getByPlaceholderText(/reduced churn by 30%/i)).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/briefly describe the situation/i)).not.toBeInTheDocument();
    expect(screen.getByText(/\+ stakeholder management/i)).toBeInTheDocument();
});

test('rewrite No shows skip label', async () => {
    render(<AIWriteExperienceModal {...defaultProps} />);
    await waitFor(() => screen.getByText(/here's what this role actually needs to solve/i));
    const dropdowns = screen.getAllByRole('combobox');
    fireEvent.change(dropdowns[0], { target: { value: 'yes' } });
    await waitFor(() => expect(screen.getAllByRole('combobox').length).toBe(3));
    // Rewrite dropdown for problem 1 is at index 1 (problem 3 confirmation is at index 2)
    const allDropdowns = screen.getAllByRole('combobox');
    fireEvent.change(allDropdowns[1], { target: { value: 'no' } });
    await waitFor(() => screen.getByText(/skipped — keeping your existing bullets/i));
    expect(screen.getByText(/skipped — keeping your existing bullets/i)).toBeInTheDocument();
});

test('Add another experience button appends a story field for the second entry only', async () => {
    render(<AIWriteExperienceModal {...defaultProps} />);
    await waitFor(() => screen.getByText(/here's what this role actually needs to solve/i));
    const dropdowns = screen.getAllByRole('combobox');
    fireEvent.change(dropdowns[0], { target: { value: 'no' } });
    const addBtn = screen.getByRole('button', { name: /add another experience/i });
    fireEvent.click(addBtn);
    // Only the second entry shows the story textarea; first entry never shows it
    expect(screen.getAllByPlaceholderText(/briefly describe the situation/i)).toHaveLength(1);
});

test('clicking a keyword chip toggles it to selected state', async () => {
    render(<AIWriteExperienceModal {...defaultProps} />);
    await waitFor(() => screen.getByText(/here's what this role actually needs to solve/i));
    // Chip starts unselected (+ prefix)
    const chip = screen.getAllByText(/\+ stakeholder management/i)[0];
    fireEvent.click(chip);
    // After click, chip should be selected (✓ prefix)
    expect(screen.getByText(/✓ stakeholder management/i)).toBeInTheDocument();
    // Click again to deselect
    fireEvent.click(screen.getByText(/✓ stakeholder management/i));
    expect(screen.getAllByText(/\+ stakeholder management/i)[0]).toBeInTheDocument();
});

test('Generate button disabled until all ai_has_experience=true problems are resolved', async () => {
    render(<AIWriteExperienceModal {...defaultProps} />);
    await waitFor(() => screen.getByText(/here's what this role actually needs to solve/i));
    expect(screen.getByRole('button', { name: /generate bullets/i })).toBeDisabled();
});

test('Generate button enables when resolved problems include at least one to generate', async () => {
    render(<AIWriteExperienceModal {...defaultProps} />);
    await waitFor(() => screen.getByText(/here's what this role actually needs to solve/i));

    const dropdowns = screen.getAllByRole('combobox');
    // Problem 1: confirm No — first entry always included, no story required
    fireEvent.change(dropdowns[0], { target: { value: 'no' } });
    // Problem 3: confirm Yes -> rewrite No (skip)
    const allDropdowns = screen.getAllByRole('combobox');
    fireEvent.change(allDropdowns[1], { target: { value: 'yes' } });
    await waitFor(() => expect(screen.getAllByRole('combobox').length).toBeGreaterThan(2));
    const updatedDropdowns = screen.getAllByRole('combobox');
    fireEvent.change(updatedDropdowns[updatedDropdowns.length - 1], { target: { value: 'no' } });

    expect(screen.getByRole('button', { name: /generate bullets/i })).not.toBeDisabled();
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
                bullets: [{ problem_title: 'Stakeholder Communication', bullet: 'Led stakeholder management across 3 regions' }],
            }),
        });

    render(<AIWriteExperienceModal {...defaultProps} />);
    await waitFor(() => screen.getByText(/here's what this role actually needs to solve/i));

    const dropdowns = screen.getAllByRole('combobox');
    // Problem 1: confirm No — first entry always included, no story required
    fireEvent.change(dropdowns[0], { target: { value: 'no' } });

    const allDropdowns = screen.getAllByRole('combobox');
    fireEvent.change(allDropdowns[1], { target: { value: 'yes' } });
    await waitFor(() => expect(screen.getAllByRole('combobox').length).toBeGreaterThan(2));
    const updatedDropdowns = screen.getAllByRole('combobox');
    fireEvent.change(updatedDropdowns[updatedDropdowns.length - 1], { target: { value: 'no' } });

    fireEvent.click(screen.getByRole('button', { name: /generate bullets/i }));
    await waitFor(() => screen.getByText(/keyword coverage/i));

    expect(screen.getByText(/✓ stakeholder management/i)).toBeInTheDocument();
    expect(screen.getByText(/✗ agile/i)).toBeInTheDocument();
});
