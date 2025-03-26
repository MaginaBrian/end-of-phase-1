document.addEventListener('DOMContentLoaded', function() {
    startVotingSystem();
});

const votingSystem = {
    votes: {},
    candidates: [],
    votedUsers: [],
    users: {},
    currentUser: null
};

function startVotingSystem() {
    loadUsers();
    loadCandidates();
    loadVotes();
    
}

function loadUsers() {
    fetch('http://localhost:3000/users')
        .then(response => response.json())
        .then(data => {
            votingSystem.users = data;
        })
        .catch(error => console.error('Error loading users:', error));
}

function loadCandidates() {
    fetch('http://localhost:3000/candidates')
        .then(response => response.json())
        .then(data => {
            votingSystem.candidates = data;
            votingSystem.candidates.forEach(candidate => {
                votingSystem.votes[candidate.name] = 0;
            });
            showCandidates();
        })
        .catch(error => console.error('Error loading candidates:', error));
}

function loadVotes() {
    fetch('http://localhost:3000/votes')
        .then(response => response.json())
        .then(votes => {
            votes.forEach(vote => {
                votingSystem.votes[vote.candidate] = (votingSystem.votes[vote.candidate] || 0) + 1;
                votingSystem.votedUsers.push(vote.user);
            });
            showResults();
        })
        .catch(error => console.error('Error loading votes:', error));
}

function showCandidates() {
    const form = document.getElementById('voteForm');
    form.innerHTML = '';
    votingSystem.candidates.forEach(candidate => {
        form.innerHTML += `
            <label>
                <input type="radio" name="candidate" value="${candidate.name}">
                ${candidate.name}
            </label><br>
        `;
    });
}

function showResults() {
    const results = document.getElementById('results');
    results.innerHTML = '';
    votingSystem.candidates.forEach(candidate => {
        results.innerHTML += `
            <p>${candidate.name}: <span>${votingSystem.votes[candidate.name] || 0}</span> votes</p>
        `;
    });
    document.getElementById('totalVotes').textContent = votingSystem.votedUsers.length;
}

function submitVote(candidate) {
    fetch('http://localhost:3000/votes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            user: votingSystem.currentUser,
            candidate: candidate,
            timestamp: new Date().toISOString()
        })
    })
    .then(response => {
        if (response.ok) {
            votingSystem.votes[candidate] = (votingSystem.votes[candidate] || 0) + 1;
            votingSystem.votedUsers.push(votingSystem.currentUser);
            showResults();
            alert('Vote submitted!');
        } else {
            alert('Vote failed!');
        }
    })
    .catch(error => console.error('Error submitting vote:', error));
}




function handleLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (votingSystem.users[username] === password) {
        votingSystem.currentUser = username;
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('votingSection').style.display = 'block';
        alert('Welcome, ' + username + '!');
    } else {
        alert('Wrong username or password!');
    }
}

function handleVoteSubmit() {
    if (!votingSystem.currentUser) {
        alert('Please login first!');
        return;
    }

    if (votingSystem.votedUsers.includes(votingSystem.currentUser)) {
        alert('You already voted!');
        return;
    }

    const selected = document.querySelector('input[name="candidate"]:checked');
    if (!selected) {
        alert('Please pick a candidate!');
        return;
    }

    submitVote(selected.value);
}