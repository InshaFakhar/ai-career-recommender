import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { predictCareer } from '../services/api';

const AssessmentForm = () => {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    skills: 'Python',
    interests: 'Data scientist',
    cgpa: '3.8',
    certifications: 'Yes',
    experience: 'Yes',
    domain: 'Engineering',
    workshops: 'Yes',
    hackathons: 'Yes',
    self_learning: 'Yes',
    extra_courses: ''
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    setLoading(true);

    try {

      // CLEAN VALUES
      const cleanedData = {
        ...formData,

        skills: formData.skills.trim(),
        interests: formData.interests.trim(),
        domain: formData.domain.trim(),
        extra_courses: formData.extra_courses.trim()
      };

      console.log("Submitting:", cleanedData);

      const response = await predictCareer(cleanedData);

      console.log("Prediction Response:", response);

      navigate('/result', {
        state: {
          result: response,
          input: cleanedData
        }
      });

    } catch (error) {

      console.error(error);

      alert(
        "Prediction failed. Make sure Flask backend is running."
      );

    } finally {

      setLoading(false);
    }
  };

  return (

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card"
      style={{
        maxWidth: '900px',
        margin: '0 auto'
      }}
    >

      <div
        style={{
          textAlign: 'center',
          marginBottom: '2.5rem'
        }}
      >

        <h2
          style={{
            fontSize: '2rem'
          }}
        >
          Comprehensive
          <span className="gradient-text">
            {' '}Profile Analysis
          </span>
        </h2>

        <p
          style={{
            color: 'var(--text-muted)'
          }}
        >
          Fill your profile for AI-powered
          career recommendation.
        </p>

      </div>


      <form onSubmit={handleSubmit}>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1.5rem'
          }}
        >

          {/* SKILLS */}

          <div className="form-group">

            <label>Primary Skill</label>

            <select
              name="skills"
              value={formData.skills}
              onChange={handleChange}
            >

              <option value="Python">Python</option>

              <option value="Java">Java</option>

              <option value="SQL">SQL</option>

              <option value="Machine Learning">
                Machine Learning
              </option>

              <option value="Cloud Computing">
                Cloud Computing
              </option>

              <option value="Networking">
                Networking
              </option>

              <option value="Accounting Skills">
                Accounting Skills
              </option>

              <option value="Teamwork">
                Team Work
              </option>

              <option value="Communication Skills">
                Communication Skills
              </option>

              <option value="Analytical Skills">
                Analytical Skills
              </option>

              <option value="Business Knowledge">
                Business Knowledge
              </option>

              <option value="Editing">
                Editing
              </option>

              <option value="Critical Thinking">
                Critical Thinking
              </option>

              <option value="CAD/CAE(autocad/catia/ansys/proE/SeimensNX)">
                CAD/CAE
              </option>

              <option value="PHP">PHP</option>

              <option value="HTML">HTML</option>

              <option value="C#">C#</option>

            </select>

          </div>


          {/* INTERESTS */}

          <div className="form-group">

            <label>Field of Interest</label>

            <select
              name="interests"
              value={formData.interests}
              onChange={handleChange}
            >

              <option value="Data scientist">
                Data Science
              </option>

              <option value="Technology">
                Technology
              </option>

              <option value="Cloud computing">
                Cloud Computing
              </option>

              <option value="Financial Analysis">
                Financial Analysis
              </option>

              <option value="Research">
                Research
              </option>

              <option value="Trading">
                Trading
              </option>

              <option value="Design">
                Design
              </option>

              <option value="Govt. Job">
                Govt. Job
              </option>

              <option value="Machine Learning">
                Machine Learning
              </option>

              <option value="Software Job">
                Software Job
              </option>

              {/* dataset spelling */}
              <option value="Cyber Secuirty">
                Cyber Security
              </option>

              <option value="Web development">
                Web Development
              </option>

              <option value="Data Analytics">
                Data Analytics
              </option>

              <option value="Entrepreneurship">
                Entrepreneurship
              </option>

              <option value="Marketing">
                Marketing
              </option>

              <option value="Human Resource">
                Human Resource
              </option>

            </select>

          </div>


          {/* CGPA */}

          <div className="form-group">

            <label>CGPA (out of 4)</label>

            <input
              type="number"
              step="0.01"
              min="0"
              max="4"
              required
              name="cgpa"
              value={formData.cgpa}
              onChange={handleChange}
            />

          </div>


          {/* CERTIFICATIONS */}

          <div className="form-group">

            <label>Certifications</label>

            <select
              name="certifications"
              value={formData.certifications}
              onChange={handleChange}
            >

              <option value="Yes">Yes</option>

              <option value="No">No</option>

            </select>

          </div>


          {/* EXPERIENCE */}

          <div className="form-group">

            <label>Work Experience</label>

            <select
              name="experience"
              value={formData.experience}
              onChange={handleChange}
            >

              <option value="Yes">Yes</option>

              <option value="No">No</option>

            </select>

          </div>


          {/* DOMAIN */}

          <div className="form-group">

            <label>Domain Preference</label>

            <select
              name="domain"
              value={formData.domain}
              onChange={handleChange}
            >

              <option value="Engineering">
                Engineering
              </option>

              <option value="Commerce">
                Commerce
              </option>

              <option value="Business / Management">
                Business / Management
              </option>

              <option value="Computer Applications">
                Computer Applications
              </option>

              <option value="Science">
                Science
              </option>

              <option value="Arts / Humanities / Law">
                Arts / Humanities / Law
              </option>

              <option value="Pharmacy">
                Pharmacy
              </option>

              <option value="Other">
                Other
              </option>

            </select>

          </div>


          {/* WORKSHOPS */}

          <div className="form-group">

            <label>Workshops Attended</label>

            <select
              name="workshops"
              value={formData.workshops}
              onChange={handleChange}
            >

              <option value="Yes">Yes</option>

              <option value="No">No</option>

            </select>

          </div>


          {/* HACKATHONS */}

          <div className="form-group">

            <label>Hackathons</label>

            <select
              name="hackathons"
              value={formData.hackathons}
              onChange={handleChange}
            >

              <option value="Yes">Yes</option>

              <option value="No">No</option>

            </select>

          </div>


          {/* SELF LEARNING */}

          <div className="form-group">

            <label>Self Learning</label>

            <select
              name="self_learning"
              value={formData.self_learning}
              onChange={handleChange}
            >

              <option value="Yes">Yes</option>

              <option value="No">No</option>

            </select>

          </div>


          {/* EXTRA COURSES */}

          <div className="form-group">

            <label>Extra Courses</label>

            <input
              type="text"
              name="extra_courses"
              value={formData.extra_courses}
              onChange={handleChange}
              placeholder="Enter extra courses/certifications"
            />

          </div>

        </div>


        <div
          style={{
            textAlign: 'center',
            marginTop: '2.5rem'
          }}
        >

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{
              width: '100%',
              padding: '1.2rem',
              fontSize: '1.1rem'
            }}
          >

            {
              loading
                ? 'Processing...'
                : 'Generate AI Career Recommendation'
            }

          </button>

        </div>

      </form>

    </motion.div>
  );
};

export default AssessmentForm;